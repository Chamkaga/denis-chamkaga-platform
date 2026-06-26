// src/services/auth.service.ts
// Handles login, token generation, refresh, and logout logic.

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

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

const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY as jwt.SignOptions['expiresIn'],
  });
};

const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY as jwt.SignOptions['expiresIn'],
  });
};

export const authService = {
  async login(email: string, password: string): Promise<LoginResult> {
    // Find user with role
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
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

    return {
      accessToken: generateAccessToken(tokenPayload),
      refreshToken: generateRefreshToken(tokenPayload),
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

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as TokenPayload;

      // Ensure user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: { role: true },
      });

      if (!user || !user.isActive) {
        throw new AppError(401, 'UNAUTHORIZED', 'User no longer active');
      }

      const newPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
        roleId: user.roleId,
        roleName: user.role.name,
        mustChangePassword: user.mustChangePassword,
      };

      return { accessToken: generateAccessToken(newPayload) };
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new AppError(401, 'REFRESH_TOKEN_EXPIRED', 'Refresh token has expired, please login again');
      }
      if (err instanceof AppError) throw err;
      throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Invalid refresh token');
    }
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
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
};
