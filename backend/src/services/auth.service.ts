import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { LocalEventBus } from '../events/LocalEventBus';
import { createAuthEvent } from '../events/auth.events';
import { NotificationProviderFactory } from '../providers/notification.factory';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
    mustChangePassword: boolean;
  };
}

export interface TokenPayload {
  userId: string;
  email: string;
  roleId: string;
  roleName: string;
  mustChangePassword?: boolean;
}

export interface AuthContextOptions {
  ipAddress?: string;
  userAgent?: string;
  device?: string;
}

// ── Password Policy Validator ──────────────────────────────────────────────────
export function validatePasswordStrength(password: string): void {
  if (password.length < 8) {
    throw new AppError(400, 'WEAK_PASSWORD', 'Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    throw new AppError(400, 'WEAK_PASSWORD', 'Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    throw new AppError(400, 'WEAK_PASSWORD', 'Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    throw new AppError(400, 'WEAK_PASSWORD', 'Password must contain at least one number');
  }
  if (!/[\W_]/.test(password)) {
    throw new AppError(400, 'WEAK_PASSWORD', 'Password must contain at least one special character');
  }
}

const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign({ ...payload, jti: crypto.randomUUID() }, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY as jwt.SignOptions['expiresIn'],
  });
};

const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign({ ...payload, jti: crypto.randomUUID() }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY as jwt.SignOptions['expiresIn'],
  });
};

const eventBus = new LocalEventBus();

export const authService = {
  async logoutByRefreshToken(refreshTokenStr: string): Promise<void> {
    const tokenHashStr = hashToken(refreshTokenStr);
    await prisma.$transaction([
      prisma.refreshToken.updateMany({ where: { tokenHash: tokenHashStr }, data: { isRevoked: true } }),
      prisma.session.deleteMany({ where: { token: tokenHashStr } })
    ]);
  },

  async verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  },

  async login(email: string, password: string, options?: AuthContextOptions): Promise<LoginResult> {
    const normalizedEmail = email.toLowerCase().trim();

    // Find user with role
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      // Record failed login attempt audit log
      if (user) {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'LOGIN_FAILED',
            resource: 'users',
            resourceId: user.id,
            ipAddress: options?.ipAddress,
            userAgent: options?.userAgent,
          },
        });
      }
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN_FAILED',
          resource: 'users',
          resourceId: user.id,
          ipAddress: options?.ipAddress,
          userAgent: options?.userAgent,
        },
      });
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role.name,
      mustChangePassword: user.mustChangePassword,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Save refresh token hash in DB
    const refreshTokenHash = hashToken(refreshToken);
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt: refreshExpiresAt,
      },
    });

    // Create session record
    await prisma.session.create({
      data: {
        userId: user.id,
        token: refreshTokenHash,
        device: options?.device || 'Unknown Device',
        ipAddress: options?.ipAddress,
        userAgent: options?.userAgent,
        expiresAt: refreshExpiresAt,
      },
    });

    // Record audit log & publish event
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN_SUCCESS',
        resource: 'users',
        resourceId: user.id,
        ipAddress: options?.ipAddress,
        userAgent: options?.userAgent,
      },
    });

    eventBus.publish(
      createAuthEvent('UserLoggedIn', {
        userId: user.id,
        email: user.email,
        ipAddress: options?.ipAddress,
        userAgent: options?.userAgent,
      }, user.id)
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
        mustChangePassword: user.mustChangePassword,
      },
    };
  },

  async refresh(refreshTokenStr: string, options?: AuthContextOptions): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = jwt.verify(refreshTokenStr, env.JWT_REFRESH_SECRET) as TokenPayload;
      const tokenHashStr = hashToken(refreshTokenStr);

      const dbToken = await prisma.refreshToken.findUnique({
        where: { tokenHash: tokenHashStr },
      });

      // Token reuse detection: If presented a revoked token, revoke ALL user refresh tokens (security measure)
      if (!dbToken || dbToken.isRevoked || dbToken.expiresAt < new Date()) {
        if (dbToken && dbToken.isRevoked) {
          // Revoke all tokens for this user due to potential token theft
          await prisma.refreshToken.updateMany({
            where: { userId: payload.userId },
            data: { isRevoked: true },
          });
        }
        throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid or expired');
      }

      // Revoke current refresh token (Refresh Token Rotation)
      await prisma.refreshToken.update({
        where: { id: dbToken.id },
        data: { isRevoked: true },
      });

      // Fetch user to verify active status
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: { role: true },
      });

      if (!user || !user.isActive) {
        throw new AppError(401, 'UNAUTHORIZED', 'User account is inactive');
      }

      const newPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        roleId: user.roleId,
        roleName: user.role.name,
        mustChangePassword: user.mustChangePassword,
      };

      const newAccessToken = generateAccessToken(newPayload);
      const newRefreshToken = generateRefreshToken(newPayload);
      const newRefreshTokenHash = hashToken(newRefreshToken);
      const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: newRefreshTokenHash,
          expiresAt: refreshExpiresAt,
        },
      });

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new AppError(401, 'REFRESH_TOKEN_EXPIRED', 'Refresh token has expired, please login again');
      }
      if (err instanceof AppError) throw err;
      throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Invalid refresh token');
    }
  },

  async logout(userId: string, refreshTokenStr?: string): Promise<void> {
    if (refreshTokenStr) {
      const tokenHashStr = hashToken(refreshTokenStr);
      await prisma.refreshToken.updateMany({
        where: { tokenHash: tokenHashStr },
        data: { isRevoked: true },
      });
      await prisma.session.updateMany({
        where: { token: tokenHashStr },
        data: { isTerminated: true },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'LOGOUT',
        resource: 'users',
        resourceId: userId,
      },
    });

    eventBus.publish(
      createAuthEvent('UserLoggedOut', { userId }, userId)
    );
  },

  async revokeRefreshToken(tokenHashStr: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { tokenHash: tokenHashStr },
      data: { isRevoked: true },
    });
  },

  async forgotPassword(email: string): Promise<{ resetToken: string }> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user || !user.isActive) {
      // Don't expose whether email exists for security, return mock token format
      return { resetToken: 'sent' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = hashToken(resetToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: resetTokenHash,
        expiresAt,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        resource: 'users',
        resourceId: user.id,
      },
    });

    eventBus.publish(
      createAuthEvent('PasswordResetRequested', {
        userId: user.id,
        email: user.email,
        token: resetToken,
      }, user.id)
    );

    // Send real email via Notification Provider interface
    try {
      const notificationProvider = NotificationProviderFactory.getProvider();
      const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      await notificationProvider.sendEmail(
        user.email,
        'Password Reset Request - Denis Chamkaga Platform',
        `<p>Hello ${user.firstName},</p><p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 1 hour.</p>`
      );
    } catch (emailErr) {
      console.error('[AuthService Email Dispatch Error]', emailErr);
    }

    return { resetToken };
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    validatePasswordStrength(newPassword);

    const tokenHashStr = hashToken(token);
    const dbToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: tokenHashStr },
    });

    if (!dbToken || dbToken.isUsed || dbToken.expiresAt < new Date()) {
      throw new AppError(400, 'INVALID_RESET_TOKEN', 'Password reset token is invalid or expired');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: dbToken.userId },
        data: { passwordHash, mustChangePassword: false },
      }),
      prisma.passwordResetToken.update({
        where: { id: dbToken.id },
        data: { isUsed: true },
      }),
    ]);

    await prisma.auditLog.create({
      data: {
        userId: dbToken.userId,
        action: 'PASSWORD_RESET_COMPLETED',
        resource: 'users',
        resourceId: dbToken.userId,
      },
    });

    eventBus.publish(
      createAuthEvent('PasswordResetCompleted', { userId: dbToken.userId }, dbToken.userId)
    );
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    validatePasswordStrength(newPassword);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash, mustChangePassword: false },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'PASSWORD_CHANGED',
        resource: 'users',
        resourceId: userId,
      },
    });

    eventBus.publish(
      createAuthEvent('PasswordChanged', { userId }, userId)
    );
  },

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: { include: { permissions: true } } },
    });
    if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  },

  async terminateSession(userId: string, sessionId: string): Promise<void> {
    await prisma.session.updateMany({
      where: { id: sessionId, userId },
      data: { isTerminated: true },
    });
  },

  async terminateAllSessions(userId: string): Promise<void> {
    await prisma.session.updateMany({
      where: { userId },
      data: { isTerminated: true },
    });
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  },
};
