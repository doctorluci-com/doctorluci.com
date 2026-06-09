import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../env.js';

export interface AuthenticatedRequest extends Request {
  adminUser?: {
    email: string;
  };
}

export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Access token is missing or malformed',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Explicitly enforce the HS256 algorithm and reject other algorithms
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ['HS256'],
    }) as { email: string; exp?: number };

    // Attach user info to request
    req.adminUser = {
      email: decoded.email,
    };

    return next();
  } catch (err) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired access token',
    });
  }
}
