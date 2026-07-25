// backend/src/middleware/idempotency.middleware.ts
// Enterprise API Idempotency-Key Middleware for Financial & Mutation Safety

import { Request, Response, NextFunction } from 'express';
import { otelLogger } from '../utils/otel-logger';

const idempotencyCache = new Map<string, { statusCode: number; body: any; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export const idempotencyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const idempotencyKey = req.headers['idempotency-key'] as string;

  if (!idempotencyKey || req.method === 'GET') {
    return next();
  }

  const cacheKey = `${req.path}:${idempotencyKey}`;
  const cachedResponse = idempotencyCache.get(cacheKey);

  if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_TTL_MS) {
    otelLogger.info(`[Idempotency] Returning cached response for key: ${idempotencyKey}`);
    res.setHeader('X-Cache-Lookup', 'HIT');
    return res.status(cachedResponse.statusCode).json(cachedResponse.body);
  }

  const originalJson = res.json.bind(res);
  res.json = (body: any): Response => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      idempotencyCache.set(cacheKey, {
        statusCode: res.statusCode,
        body,
        timestamp: Date.now()
      });
    }
    return originalJson(body);
  };

  next();
};
