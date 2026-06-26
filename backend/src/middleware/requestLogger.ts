// src/middleware/requestLogger.ts
// Logs every incoming HTTP request with method, path, status, and duration.

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    logger[level](
      `${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`,
      {
        ip: req.ip,
        userAgent: req.get('user-agent'),
      }
    );
  });

  next();
};
