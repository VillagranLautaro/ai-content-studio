import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import generateRoutes from './routes/generate.routes';
import historyRoutes from './routes/history.routes';
import { errorHandler, notFound } from './middleware/error.middleware';
import { testConnection } from './db/connection';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Security middleware ──────────────────────────────────
app.use(helmet());

const corsOptions: cors.CorsOptions = {
  origin: 'https://ai-content-studio-2xdq.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Handle preflight OPTIONS requests before any route or rate-limit middleware
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// ─── Body parsing ─────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Rate limiting ────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 1000 : 10,
  message: { success: false, error: 'Demasiados intentos. Esperá un momento.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 1000 : 100,
  message: { success: false, error: 'Demasiadas solicitudes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Routes ───────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/generate', apiLimiter, generateRoutes);
app.use('/api/history', apiLimiter, historyRoutes);
app.use('/api', apiLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'AI Content Studio API running', env: process.env.NODE_ENV });
});

// ─── Error handling ───────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start (only when not in test mode) ──────────────────
if (process.env.NODE_ENV !== 'test') {
  async function start() {
    const dbOk = await testConnection();
    if (!dbOk) {
      console.error('[Server] Database connection failed. Exiting.');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`[Server] Running on http://localhost:${PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV}`);
    });
  }
  start();
}

export default app;
