import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { env } from './env.js';
import { errorHandler } from './middleware/error.js';
import appointmentRoutes from './routes/appointments.js';
import authRoutes from './routes/auth.js';
import stripeRoutes from './routes/stripe.js';
import subscriptionRoutes from './routes/subscriptions.js';
import newsletterRoutes from './routes/newsletter.js';
import downloadRoutes from './routes/download.js';

const app = express();

// Trust Nginx reverse proxy headers (e.g., X-Forwarded-For)
app.set('trust proxy', 1);

// ─── Security headers ────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  frameguard: { action: 'deny' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman, mobile apps) only in dev
    if (!origin && env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    if (origin && allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS: Origin '${origin}' is not allowed`));
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ─── Request parsing ──────────────────────────────────────────────────────────
// Stripe webhook requires raw body for signature verification
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

// ─── Request logging ──────────────────────────────────────────────────────────
app.use(pinoHttp({
  level: env.NODE_ENV === 'production' ? 'warn' : 'info',
  // Redact sensitive fields from logs
  redact: ['req.headers.authorization'],
  serializers: {
    req(req: any) {
      return {
        method: req.method,
        url: req.url,
        remoteAddress: req.remoteAddress,
      };
    },
  },
}));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/download', downloadRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', env: env.NODE_ENV });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'NotFound' });
});

// ─── Centralized error handler ───────────────────────────────────────────────
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(env.PORT, '127.0.0.1', () => {
  console.log(`✅ Server running at http://127.0.0.1:${env.PORT} [${env.NODE_ENV}]`);
});

export default app;
