// src/controllers/auth.controller.ts
// Handles HTTP layer for authentication endpoints.

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

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
});

export const authController = {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const result = await authService.login(email, password);

      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = refreshSchema.parse(req.body);
      const result = await authService.refresh(refreshToken);

      res.status(200).json({ success: true, data: result } satisfies ApiResponse);
    } catch (err) {
      next(err);
    }
  },

  async logout(_req: Request, res: Response): Promise<void> {
    // With stateless JWT, logout is handled on the client by discarding tokens.
    // Future: maintain a token blocklist in Redis.
    res.status(200).json({
      success: true,
      data: { message: 'Logged out successfully' },
    } satisfies ApiResponse);
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
