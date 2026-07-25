import { ILogger, LoggerContext } from './logger.interface';
import winstonLogger from './logger';

class WinstonLoggerAdapter implements ILogger {
  info(message: string, context?: LoggerContext, ...meta: any[]): void {
    winstonLogger.info(message, { ...context, ...meta });
  }

  warn(message: string, context?: LoggerContext, ...meta: any[]): void {
    winstonLogger.warn(message, { ...context, ...meta });
  }

  error(message: string, context?: LoggerContext, ...meta: any[]): void {
    winstonLogger.error(message, { ...context, ...meta });
  }

  debug(message: string, context?: LoggerContext, ...meta: any[]): void {
    winstonLogger.debug(message, { ...context, ...meta });
  }

  success(message: string, context?: LoggerContext, ...meta: any[]): void {
    winstonLogger.success(message, { ...context, ...meta });
  }
}

const adapterInstance = new WinstonLoggerAdapter();

export class LoggerFactory {
  static getLogger(): ILogger {
    return adapterInstance;
  }
}
