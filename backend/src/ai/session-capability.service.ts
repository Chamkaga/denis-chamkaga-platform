import jwt from 'jsonwebtoken';
import { Request } from 'express';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import prisma from '../config/database';

const ISSUER = 'denis-chamkaga-platform';
const AUDIENCE = 'mary-conversation';
const CAPABILITY_TTL = '2h';

interface SessionCapabilityPayload extends jwt.JwtPayload {
  kind: 'mary-session';
  sessionId: string;
  visitorId: string;
}

function secret(): string {
  return env.SESSION_CAPABILITY_SECRET || env.JWT_SECRET;
}

function readCapability(req: Request): string | undefined {
  const value = req.header('x-session-capability');
  return value?.trim() || undefined;
}

export const sessionCapabilityService = {
  issue(sessionId: string, visitorId: string): string {
    return jwt.sign(
      { kind: 'mary-session', sessionId, visitorId },
      secret(),
      { expiresIn: CAPABILITY_TTL, issuer: ISSUER, audience: AUDIENCE, subject: sessionId }
    );
  },

  verify(token: string): SessionCapabilityPayload {
    try {
      const payload = jwt.verify(token, secret(), {
        issuer: ISSUER,
        audience: AUDIENCE,
      }) as SessionCapabilityPayload;
      if (payload.kind !== 'mary-session' || !payload.sessionId || !payload.visitorId) {
        throw new Error('Invalid capability scope');
      }
      return payload;
    } catch (error) {
      const expired = error instanceof jwt.TokenExpiredError;
      throw new AppError(
        401,
        expired ? 'SESSION_CAPABILITY_EXPIRED' : 'INVALID_SESSION_CAPABILITY',
        expired ? 'Conversation access has expired' : 'Conversation access is invalid'
      );
    }
  },

  async assertRequestAccess(req: Request, expected: { sessionId?: string; visitorId?: string }): Promise<SessionCapabilityPayload> {
    const token = readCapability(req);
    if (!token) throw new AppError(401, 'SESSION_CAPABILITY_REQUIRED', 'Conversation access is required');
    const payload = this.verify(token);
    if (expected.sessionId && payload.sessionId !== expected.sessionId) {
      throw new AppError(403, 'SESSION_ACCESS_DENIED', 'Conversation access denied');
    }
    if (expected.visitorId && payload.visitorId !== expected.visitorId) {
      throw new AppError(403, 'VISITOR_ACCESS_DENIED', 'Visitor access denied');
    }
    const session = await prisma.chatSession.findUnique({
      where: { id: payload.sessionId },
      select: { visitorId: true },
    });
    if (!session || session.visitorId !== payload.visitorId) {
      throw new AppError(403, 'SESSION_ACCESS_DENIED', 'Conversation access denied');
    }
    return payload;
  },
};

