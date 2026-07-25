import { z } from 'zod';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
});

export const backendEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // CORS
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),

  // AI Provider
  AI_PROVIDER: z.string().default('openai'),

  // OpenAI Configuration
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),

  // Admin Bootstrap
  ADMIN_EMAIL: z.string().email().default('admin@denischamkaga.com'),
  ADMIN_INITIAL_PASSWORD: z.string().min(8).default('Denis@Platform2025'),

  // Mail
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  // Uploads
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE: z.coerce.number().default(10485760),

  // Storage Adapters
  STORAGE_PROVIDER: z.enum(['local', 's3', 'r2', 'gcs']).default('local'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_BUCKET_NAME: z.string().optional(),
  AWS_S3_CUSTOM_DOMAIN: z.string().optional(),

  // Flutterwave
  FLW_PUBLIC_KEY: z.string().optional(),
  FLW_SECRET_KEY: z.string().optional(),
  FLW_ENCRYPTION_KEY: z.string().optional(),
  FLW_WEBHOOK_SECRET: z.string().optional(),

  // Feature Flags
  AI_VISITOR_INTELLIGENCE: z.preprocess((val) => val === 'true' || val === '1' || val === true || val === undefined, z.boolean()).default(true),
  AI_MEMORY_ENGINE: z.preprocess((val) => val === 'true' || val === '1' || val === true || val === undefined, z.boolean()).default(true),
  AI_KNOWLEDGE_ENGINE: z.preprocess((val) => val === 'true' || val === '1' || val === true || val === undefined, z.boolean()).default(true),
  AI_LEAD_INTELLIGENCE: z.preprocess((val) => val === 'true' || val === '1' || val === true || val === undefined, z.boolean()).default(true),
  AI_ADMIN_COPILOT: z.preprocess((val) => val === 'true' || val === '1' || val === true, z.boolean()).default(false),
  PAYMENT_DPO_ENABLED: z.preprocess((val) => val === 'true' || val === '1' || val === true || val === undefined, z.boolean()).default(true),
  PAYMENT_DPO_SANDBOX: z.preprocess((val) => val === 'true' || val === '1' || val === true || val === undefined, z.boolean()).default(true),
  WEBRTC_ENABLED: z.preprocess((val) => val === 'true' || val === '1' || val === true, z.boolean()).default(false),

  // Payments
  PAYMENT_PROVIDER: z.string().default('dpo'),
  DPO_COMPANY_TOKEN: z.string().optional(),
  DPO_SERVICE_TYPE: z.string().optional(),

  // Debug settings
  DEBUG: z.preprocess((val) => val === 'true' || val === '1' || val === true, z.boolean()).default(false),
});

export const frontendEnvSchema = z.object({
  VITE_API_URL: z.string().url().default('http://localhost:5000/api'),
  VITE_WS_URL: z.string().optional()
});
