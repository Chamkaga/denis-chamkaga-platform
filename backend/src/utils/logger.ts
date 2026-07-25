import winston from 'winston';
import { env } from '../config/env';

const { combine, timestamp, colorize, printf, json, errors } = winston.format;

// Define custom levels where success is supported and clearly colorized
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    success: 2,
    info: 3,
    debug: 4,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    success: 'green',
    info: 'cyan',
    debug: 'gray',
  },
};

winston.addColors(customLevels.colors);

// Winston format to filter out internal verbose/debug noise when env.DEBUG is false
const filterInternalDebug = winston.format((info) => {
  const message = String(info.message || '');
  const isInternalDebug = 
    message.includes('[Knowledge Automation') ||
    message.includes('subscribed to 5 knowledge event types') ||
    message.includes('[Knowledge Automation Engine]');
  
  if (isInternalDebug && !env.DEBUG) {
    return false; // Suppress this log message
  }
  return info;
});

const devFormat = combine(
  filterInternalDebug(),
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}] ${message}${metaStr}${stack ? `\n${stack}` : ''}`;
  })
);

const prodFormat = combine(
  filterInternalDebug(),
  timestamp(),
  errors({ stack: true }),
  json()
);

interface CustomLogger extends winston.Logger {
  success: winston.LeveledLogMethod;
}

export const logger = winston.createLogger({
  levels: customLevels.levels,
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: env.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [new winston.transports.Console()],
  exitOnError: false,
}) as CustomLogger;

export default logger;
