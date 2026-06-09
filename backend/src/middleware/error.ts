import { Request, Response, NextFunction } from 'express';
import { pino } from 'pino';

const logger = pino();

export interface AppError extends Error {
  status?: number;
  code?: string;
  issues?: unknown;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Log error with context, removing sensitive parameters
  logger.error({
    message: err.message,
    stack: status === 500 ? err.stack : undefined,
    status,
    url: req.originalUrl,
    method: req.method,
  }, 'Unhandled Error');

  if (res.headersSent) {
    return next(err);
  }

  // Handle validation error (Zod)
  if (err.name === 'ZodError' || err.code === 'ValidationError') {
    return res.status(400).json({
      error: 'ValidationError',
      issues: err.issues || [],
    });
  }

  // Handle standard HTTP / custom errors
  if (status < 500) {
    return res.status(status).json({
      error: err.name || 'ClientError',
      message: message,
    });
  }

  // Fail secure: never leak server stack traces or internal DB errors in production
  return res.status(500).json({
    error: 'InternalError',
  });
}
