import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './errorHandler';
import { sessionCapabilityService } from '../ai/session-capability.service';
import prisma from '../config/database';

interface AdminTokenPayload extends jwt.JwtPayload { roleName?: string; }

async function hasAuthorizedAdminToken(req: Request): Promise<boolean> {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) return false;
  try {
    const payload = jwt.verify(header.slice(7), env.JWT_SECRET) as AdminTokenPayload;
    if (payload.roleName !== 'admin' && payload.roleName !== 'super_admin') return false;
    const userId = typeof payload.userId === 'string' ? payload.userId : payload.sub;
    if (!userId) return false;
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
    return !!user?.isActive && user.role.name === payload.roleName;
  } catch {
    return false;
  }
}

export const requireConversationAccess = (scope: 'session' | 'visitor' = 'session') =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (await hasAuthorizedAdminToken(req)) {
        next();
        return;
      }
      await sessionCapabilityService.assertRequestAccess(req, {
        sessionId: scope === 'session' ? String(req.params.sessionId || req.body?.sessionId || '') : undefined,
        visitorId: scope === 'visitor' ? String(req.params.visitorId || '') : undefined,
      });
      next();
    } catch (error) {
      next(error instanceof Error ? error : new AppError(401, 'UNAUTHORIZED', 'Access denied'));
    }
  };
