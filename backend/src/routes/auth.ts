import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../env.js';

const router = Router();

const LoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);

    // Fail secure: reject if credentials don't match, using identical error messages and timing-resistant behavior
    if (email.toLowerCase() !== env.ADMIN_EMAIL.toLowerCase()) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    }

    const passwordMatches = await bcrypt.compare(password, env.ADMIN_PASSWORD_HASH);
    if (!passwordMatches) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    }

    // Issue JWT signed using HS256 algorithm with 24-hour expiration
    const token = jwt.sign(
      { email: env.ADMIN_EMAIL },
      env.JWT_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: '24h',
      }
    );

    return res.status(200).json({
      token,
      email: env.ADMIN_EMAIL,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
