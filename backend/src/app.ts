// src/app.ts
// Full Express application setup.
// All middleware, routes, and error handlers are registered here.

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { env } from './config/env';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/auth.routes';
import knowledgeRoutes from './routes/knowledge.routes';
import publicRoutes from './routes/public.routes';
import adminRoutes from './routes/admin.routes';
import aiRoutes from './routes/ai.routes';
import uploadRoutes from './routes/upload.routes';
import damRoutes from './routes/dam.routes';
import businessRoutes from './routes/business.routes';
import financeRoutes from './routes/finance.routes';
import publicDocsRoutes from './routes/public-docs.routes';
import supportersRoutes from './routes/supporters.routes';
import marketingRoutes from './routes/marketing.routes';
import telemetryRoutes from './routes/telemetry.routes';
import { correlationAndTelemetryMiddleware } from './middleware/correlation.middleware';
import { observabilityMiddleware } from './middleware/observability.middleware';
import { workflowEngine } from './workflow/workflow.engine';

// Initialize Centralized Workflow Engine
workflowEngine.initialize();

import { preventPathTraversal } from './middleware/security.middleware';

const app = express();

// Establish request identity before every middleware and route that emits telemetry.
app.use(correlationAndTelemetryMiddleware);

// ── Security Middleware ────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://checkout.flutterwave.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      connectSrc: ["'self'", 'https://api.flutterwave.com', 'https://api.openai.com'],
      frameSrc: ["'self'", 'https://checkout.flutterwave.com', 'https://www.youtube.com'],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
}));

app.use(preventPathTraversal);

const parseAllowedOrigins = (): string[] => {
  const raw = env.FRONTEND_URL || 'http://localhost:5173';
  return raw
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);
};

const allowedOrigins = parseAllowedOrigins();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    const normalizedOrigin = origin.replace(/\/+$/, '');
    
    // Check exact matches or localhost
    const isAllowed =
      allowedOrigins.includes(normalizedOrigin) ||
      normalizedOrigin.startsWith('http://localhost:') ||
      normalizedOrigin.startsWith('http://127.0.0.1:') ||
      /^https:\/\/denis-chamkaga-platform(-[a-z0-9-]+)?\.vercel\.app$/.test(normalizedOrigin);

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Capability', 'X-CSRF-Token', 'X-Correlation-ID', 'X-Request-ID'],
}));

// ── Global Rate Limiting ──────────────────────────────────────────────────────
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,                  // 500 req per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.BYPASS_RATE_LIMIT === 'true',
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' },
  },
}));

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── Request Logging & Telemetry Middleware ────────────────────────────────────
app.use(requestLogger);
app.use(observabilityMiddleware);

// ── Static Uploads ────────────────────────────────────────────────────────────
app.use('/uploads/AI_Chat_Attachments', (_req, res) => res.status(404).end());
app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR)));

// ── Telemetry & Metrics Routes ────────────────────────────────────────────────
app.use('/api/v1/telemetry', telemetryRoutes);

// ── Health (No auth, no rate limit) ──────────────────────────────────────────
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      version: '1.0.0',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
import projectWorkspaceRoutes from './routes/project-workspace.routes';

app.use('/api/v1/auth', authRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/v1/knowledge', knowledgeRoutes);
app.use('/api', publicRoutes);
app.use('/api/v1', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/admin', uploadRoutes);
app.use('/api/admin', damRoutes);
import operationsRoutes from './routes/operations.routes';

app.use('/api/admin/business', businessRoutes);
app.use('/api/admin/finance', financeRoutes);
app.use('/api/admin/supporters', supportersRoutes);
app.use('/api/admin/projects/workspace', projectWorkspaceRoutes);
app.use('/api/admin/marketing', marketingRoutes);
app.use('/api/admin/operations', operationsRoutes);
app.use('/api/public/docs', publicDocsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/v1/ai', aiRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'API endpoint not found' },
  });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler as (err: Error, req: Request, res: Response, next: NextFunction) => void);

export default app;
