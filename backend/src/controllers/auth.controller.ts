import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { ApiResponse } from '../types/api';
import crypto from 'crypto';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const refreshSchema = z.object({ refreshToken: z.string().min(1).optional() });

const REFRESH_COOKIE = 'dc_refresh';
const CSRF_COOKIE = 'dc_csrf';
const cookieOptions = { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/api', maxAge: 7 * 24 * 60 * 60 * 1000 };

function setSessionCookies(res: Response, refreshToken: string): string {
  const csrfToken = crypto.randomBytes(32).toString('base64url');
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
  res.cookie(CSRF_COOKIE, csrfToken, { ...cookieOptions, httpOnly: false, path: '/' });
  return csrfToken;
}

function readRefreshToken(req: Request): string | undefined {
  return req.cookies?.[REFRESH_COOKIE] || req.body?.refreshToken;
}

function assertCookieCsrf(req: Request): void {
  if (!req.cookies?.[REFRESH_COOKIE]) return;
  const header = req.headers['x-csrf-token'];
  if (!header || header !== req.cookies?.[CSRF_COOKIE]) {
    throw new AppError(403, 'CSRF_VALIDATION_FAILED', 'CSRF validation failed');
  }
}

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export const authController = {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await authService.login(email, password, { ipAddress, userAgent });
      const csrfToken = setSessionCookies(res, result.refreshToken);

      res.status(200).json({
        success: true,
        data: { ...result, refreshToken: env.NODE_ENV === 'production' ? undefined : result.refreshToken, csrfToken },
      } satisfies ApiResponse);
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      refreshSchema.parse(req.body || {});
      assertCookieCsrf(req);
      const refreshToken = readRefreshToken(req);
      if (!refreshToken) throw new AppError(401, 'REFRESH_TOKEN_REQUIRED', 'Refresh token is required');
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await authService.refresh(refreshToken, { ipAddress, userAgent });
      const csrfToken = setSessionCookies(res, result.refreshToken);

      res.status(200).json({ success: true, data: { ...result, refreshToken: env.NODE_ENV === 'production' ? undefined : result.refreshToken, csrfToken } } satisfies ApiResponse);
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      assertCookieCsrf(req);
      const refreshToken = readRefreshToken(req);

      if (userId) {
        await authService.logout(userId, refreshToken);
      } else if (refreshToken) {
        await authService.logoutByRefreshToken(refreshToken);
      }
      res.clearCookie(REFRESH_COOKIE, { ...cookieOptions, maxAge: undefined });
      res.clearCookie(CSRF_COOKIE, { ...cookieOptions, httpOnly: false, path: '/', maxAge: undefined });

      res.status(200).json({
        success: true,
        data: { message: 'Logged out successfully' },
      } satisfies ApiResponse);
    } catch (err) {
      next(err);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      await authService.forgotPassword(email);

      res.status(200).json({
        success: true,
        data: { message: 'If the email exists, a password reset link has been sent.' },
      } satisfies ApiResponse);
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPassword } = resetPasswordSchema.parse(req.body);
      await authService.resetPassword(token, newPassword);

      res.status(200).json({
        success: true,
        data: { message: 'Password has been reset successfully.' },
      } satisfies ApiResponse);
    } catch (err) {
      next(err);
    }
  },

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
      await authService.changePassword(req.user!.id, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        data: { message: 'Password changed successfully' },
      } satisfies ApiResponse);
    } catch (err) {
      next(err);
    }
  },

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await authService.getProfile(req.user!.id);
      res.status(200).json({ success: true, data: profile } satisfies ApiResponse);
    } catch (err) {
      next(err);
    }
  },
};
