// backend/src/middleware/multi-level-rate-limiter.middleware.ts
// Multi-Level Rate Limiting Middleware (Per IP, Per User, Per Org, Per API Key)

import { Request, Response, NextFunction } from 'express';
import { otelLogger } from '../utils/otel-logger';

const requestCounts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 120; // 120 reqs/min

export const multiLevelRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const userId = (req as any).user?.id || 'anonymous';
  const orgId = (req as any).user?.organizationId || 'default';
  const apiKey = (req.headers['x-api-key'] as string) || 'none';

  const keys = [
    `ip:${ip}`,
    `user:${userId}`,
    `org:${orgId}`,
    `apikey:${apiKey}`
  ];

  const now = Date.now();

  for (const key of keys) {
    if (key.endsWith(':anonymous') || key.endsWith(':default') || key.endsWith(':none')) {
      continue;
    }

    const entry = requestCounts.get(key) || { count: 0, resetAt: now + WINDOW_MS };

    if (now > entry.resetAt) {
      entry.count = 1;
      entry.resetAt = now + WINDOW_MS;
    } else {
      entry.count++;
    }

    requestCounts.set(key, entry);

    if (entry.count > MAX_REQUESTS) {
      otelLogger.warn(`[RateLimiter] Rate limit exceeded for key: ${key}`);
      res.status(429).json({
        success: false,
        error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Please try again later.' }
      });
      return;
    }
  }

  next();
};
