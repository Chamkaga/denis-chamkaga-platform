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
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    const activeUser = await prisma.user.findUnique({ where: { id: payload.userId }, include: { role: true } });
    if (!activeUser?.isActive || activeUser.roleId !== payload.roleId) {
      throw new AppError(401, 'SESSION_REVOKED', 'This account session is no longer active');
    }

    req.user = {
      id: activeUser.id,
      email: activeUser.email,
      roleId: activeUser.roleId,
      roleName: activeUser.role.name,
      mustChangePassword: payload.mustChangePassword,
    };

    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      error: {
        code: err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
        message: err.message || 'Invalid or expired authentication token'
      }
    });
    return;
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

      if (req.user.roleName === 'super_admin' || req.user.roleName === 'owner') return next();
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

export const requireResourceAccess = (resource: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const action = req.method === 'GET' || req.method === 'HEAD'
      ? 'read'
      : req.method === 'DELETE'
        ? 'delete'
        : req.method === 'POST'
          ? 'create'
          : 'update';
    return requirePermission(resource, action)(req, res, next);
  };
};

export const requireMappedResourceAccess = (resolveResource: (path: string) => string) => {
  return (req: Request, res: Response, next: NextFunction) => requireResourceAccess(resolveResource(req.path))(req, res, next);
};

// ─── Admin only shortcut ──────────────────────────────────────────────────────
export const requireAdmin = [requireAuth, requireRole('admin', 'super_admin', 'owner')];
