import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { ApiResponse } from '../types/api';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

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

      res.status(200).json({
        success: true,
        data: result,
      } satisfies ApiResponse);
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = refreshSchema.parse(req.body);
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await authService.refresh(refreshToken, { ipAddress, userAgent });

      res.status(200).json({ success: true, data: result } satisfies ApiResponse);
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const refreshToken = req.body?.refreshToken;

      if (userId) {
        await authService.logout(userId, refreshToken);
      }

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
