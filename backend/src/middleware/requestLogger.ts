import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const isError = res.statusCode >= 400;
    const isSlow = duration > 500;
    const isWriteAction = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);

    // Log routine GET 200/304 only when debug is active, slow, or returning error
    const shouldLog = isError || isSlow || isWriteAction || env.DEBUG;

    if (shouldLog) {
      const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
      logger[level](
        `${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`,
        {
          ip: req.ip,
          userAgent: req.get('user-agent'),
        }
      );
    }
  });

  next();
};
