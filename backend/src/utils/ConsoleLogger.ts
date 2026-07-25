import { ILogger, LoggerContext } from './logger.interface';

export class ConsoleLogger implements ILogger {
  info(message: string, context?: LoggerContext, ...meta: any[]): void {
    console.log(`[INFO] ${message}`, context || '', ...meta);
  }

  warn(message: string, context?: LoggerContext, ...meta: any[]): void {
    console.warn(`[WARN] ${message}`, context || '', ...meta);
  }

  error(message: string, context?: LoggerContext, ...meta: any[]): void {
    console.error(`[ERROR] ${message}`, context || '', ...meta);
  }

  debug(message: string, context?: LoggerContext, ...meta: any[]): void {
    if (process.env.NODE_ENV === 'production') return;
    console.debug(`[DEBUG] ${message}`, context || '', ...meta);
  }

  success(message: string, context?: LoggerContext, ...meta: any[]): void {
    console.log(`[SUCCESS] ${message}`, context || '', ...meta);
  }
}
