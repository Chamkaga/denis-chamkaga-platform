// src/middleware/auth.middleware.ts
// JWT verification and Role-Based Access Control (RBAC).

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './errorHandler';
import prisma from '../config/database';

interface JwtPayload {
  userId: string;
  email: string;
  roleId: string;
  roleName: string;
  mustChangePassword?: boolean;
}

// ─── Require valid JWT ────────────────────────────────────────────────────────
export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    req.user = {
      id: payload.userId,
      email: payload.email,
      roleId: payload.roleId,
      roleName: payload.roleName,
      mustChangePassword: payload.mustChangePassword,
    };

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      next(new AppError(401, 'TOKEN_EXPIRED', 'Access token has expired'));
    } else if (err instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, 'INVALID_TOKEN', 'Invalid access token'));
    } else {
      next(err);
    }
  }
};

// ─── Require specific role ────────────────────────────────────────────────────
export const requireRole = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'));
      return;
    }
    if (!roles.includes(req.user.roleName)) {
      next(
        new AppError(403, 'FORBIDDEN', `Access requires one of: ${roles.join(', ')}`)
      );
      return;
    }
    next();
  };
};

// ─── Require specific permission ──────────────────────────────────────────────
export const requirePermission = (resource: string, action: string) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
      }

      const permission = await prisma.permission.findFirst({
        where: {
          roleId: req.user.roleId,
          resource,
          action,
        },
      });

      if (!permission) {
        throw new AppError(
          403,
          'FORBIDDEN',
          `You do not have permission to ${action} ${resource}`
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

// ─── Admin only shortcut ──────────────────────────────────────────────────────
export const requireAdmin = [requireAuth, requireRole('admin', 'super_admin')];
