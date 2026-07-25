// backend/src/utils/otel-logger.ts
// OpenTelemetry-Compatible Structured Logger

import { AsyncLocalStorage } from 'async_hooks';

export interface OtelLogContext {
  correlationId?: string;
  requestId?: string;
  userId?: string;
  organizationId?: string;
  module?: string;
  event?: string;
}

export const logContextStorage = new AsyncLocalStorage<OtelLogContext>();

export class OtelLogger {
  private formatLog(level: string, message: string, meta?: any) {
    const context = logContextStorage.getStore() || {};
    const logRecord = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      service: 'denis-platform-backend',
      environment: process.env.NODE_ENV || 'development',
      correlationId: context.correlationId || 'none',
      requestId: context.requestId || 'none',
      userId: context.userId || 'system',
      organizationId: context.organizationId || 'default',
      module: context.module || 'core',
      event: context.event || 'log',
      message,
      ...(meta ? { metadata: meta } : {})
    };

    if (process.env.NODE_ENV === 'production') {
      return JSON.stringify(logRecord);
    }
    return `[${logRecord.timestamp}] [${logRecord.level}] [${logRecord.correlationId}] [${logRecord.module}]: ${message}`;
  }

  info(message: string, meta?: any) {
    console.log(this.formatLog('info', message, meta));
  }

  warn(message: string, meta?: any) {
    console.warn(this.formatLog('warn', message, meta));
  }

  error(message: string, meta?: any) {
    console.error(this.formatLog('error', message, meta));
  }

  debug(message: string, meta?: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatLog('debug', message, meta));
    }
  }
}

export const otelLogger = new OtelLogger();
