// backend/src/middleware/observability.middleware.ts
// Observability, Correlation ID Tracing & Latency Telemetry Middleware

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '../utils/logger';

export interface TraceableRequest extends Request {
  correlationId?: string;
  requestId?: string;
  startTimeMs?: number;
}

export function observabilityMiddleware(req: TraceableRequest, res: Response, next: NextFunction) {
  const correlationId = (req.headers['x-correlation-id'] as string) || `corr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const requestId = (req.headers['x-request-id'] as string) || `req_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  req.correlationId = correlationId;
  req.requestId = requestId;
  req.startTimeMs = Date.now();

  res.setHeader('x-correlation-id', correlationId);
  res.setHeader('x-request-id', requestId);

  res.on('finish', () => {
    const durationMs = Date.now() - (req.startTimeMs || Date.now());
    logger.info(`[HTTP Telemetry] ${req.method} ${req.originalUrl} ${res.statusCode} - ${durationMs}ms [CorrelationID: ${correlationId}]`);
  });

  next();
}
