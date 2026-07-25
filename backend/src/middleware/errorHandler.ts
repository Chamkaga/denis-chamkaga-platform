// src/middleware/errorHandler.ts
// Global Express error handler.
// Converts all thrown errors into the standard { success, error } JSON response.

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types/api';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(`[${req.method}] ${req.path}`, {
    error: err.message,
    stack: err.stack,
  });

  const instance = req.originalUrl || req.path;

  // Zod validation errors
  if (err instanceof ZodError) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: { issues: err.issues },
      },
      problem: {
        type: 'https://api.denischamkaga.com/errors/VALIDATION_ERROR',
        title: 'Validation Error',
        status: 422,
        detail: 'Request validation failed',
        instance,
      },
    };
    res.status(422).json(response);
    return;
  }

  // Custom application errors (AppError)
  if (err instanceof AppError || err.name === 'AppError' || (err as any).statusCode) {
    const statusCode = (err as any).statusCode || 500;
    const code = (err as any).code || 'APPLICATION_ERROR';
    const response: ApiResponse = {
      success: false,
      error: {
        code,
        message: err.message,
        details: (err as any).details,
      },
      problem: {
        type: `https://api.denischamkaga.com/errors/${code}`,
        title: code,
        status: statusCode,
        detail: err.message,
        instance,
      },
    };
    res.status(statusCode).json(response);
    return;
  }
  // JWT token errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError' || err.name === 'NotBeforeError') {
    const isExpired = err.name === 'TokenExpiredError';
    const code = isExpired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN';
    const message = isExpired ? 'Access token has expired' : 'Invalid access token signature or payload';

    res.status(401).json({
      success: false,
      error: { code, message },
      problem: {
        type: `https://api.denischamkaga.com/errors/${code}`,
        title: code,
        status: 401,
        detail: message,
        instance,
      },
    } satisfies ApiResponse);
    return;
  }
  // Prisma unique constraint violations
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_ENTRY',
          message: 'A record with this value already exists',
          details: { field: err.meta?.target },
        },
        problem: {
          type: 'https://api.denischamkaga.com/errors/DUPLICATE_ENTRY',
          title: 'Duplicate Entry',
          status: 409,
          detail: 'A record with this value already exists',
          instance,
        },
      } satisfies ApiResponse);
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Record not found' },
        problem: {
          type: 'https://api.denischamkaga.com/errors/NOT_FOUND',
          title: 'Not Found',
          status: 404,
          detail: 'Record not found',
          instance,
        },
      } satisfies ApiResponse);
      return;
    }
  }

  // Default 500
  const message =
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message;

  const response: ApiResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message,
    },
    problem: {
      type: 'https://api.denischamkaga.com/errors/INTERNAL_ERROR',
      title: 'Internal Server Error',
      status: 500,
      detail: message,
      instance,
    },
  };
  res.status(500).json(response);
};
