// backend/src/middleware/correlation.middleware.ts
// Structured Correlation ID & Telemetry Middleware for Denis Business Platform

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { httpRequestCounter, httpRequestDurationHistogram } from '../telemetry/metrics';

export function correlationAndTelemetryMiddleware(req: Request, res: Response, next: NextFunction) {
  const correlationId = (req.headers['x-correlation-id'] as string) || `corr_${Date.now()}_${uuidv4().substring(0, 8)}`;
  req.headers['x-correlation-id'] = correlationId;
  res.setHeader('X-Correlation-ID', correlationId);

  const startTime = Date.now();

  res.on('finish', () => {
    const durationSec = (Date.now() - startTime) / 1000;
    const route = req.route ? req.route.path : req.path;
    const statusCode = res.statusCode.toString();

    // Record Prometheus Metrics
    httpRequestCounter.inc({ method: req.method, route, status_code: statusCode });
    httpRequestDurationHistogram.observe({ method: req.method, route, status_code: statusCode }, durationSec);
  });

  next();
}
