export interface LoggerContext {
  requestId?: string;
  userId?: string;
  module?: string;
  traceId?: string;
  [key: string]: any;
}

export interface ILogger {
  info(message: string, context?: LoggerContext, ...meta: any[]): void;
  warn(message: string, context?: LoggerContext, ...meta: any[]): void;
  error(message: string, context?: LoggerContext, ...meta: any[]): void;
  debug(message: string, context?: LoggerContext, ...meta: any[]): void;
  success?(message: string, context?: LoggerContext, ...meta: any[]): void;
}
