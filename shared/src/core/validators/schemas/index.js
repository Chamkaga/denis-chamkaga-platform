"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.frontendEnvSchema = exports.backendEnvSchema = exports.paginationQuerySchema = void 0;
const zod_1 = require("zod");
exports.paginationQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(10),
    search: zod_1.z.string().optional(),
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('asc')
});
exports.backendEnvSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    PORT: zod_1.z.coerce.number().default(5000),
    // Database
    DATABASE_URL: zod_1.z.string().min(1, 'DATABASE_URL is required'),
    // JWT
    JWT_SECRET: zod_1.z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
    JWT_ACCESS_EXPIRY: zod_1.z.string().default('15m'),
    JWT_REFRESH_EXPIRY: zod_1.z.string().default('7d'),
    // CORS
    FRONTEND_URL: zod_1.z.string().url().default('http://localhost:5173'),
    // AI Provider
    AI_PROVIDER: zod_1.z.string().default('openai'),
    // OpenAI Configuration
    OPENAI_API_KEY: zod_1.z.string().optional(),
    OPENAI_MODEL: zod_1.z.string().default('gpt-4o-mini'),
    // Admin Bootstrap
    ADMIN_EMAIL: zod_1.z.string().email().default('admin@denischamkaga.com'),
    ADMIN_INITIAL_PASSWORD: zod_1.z.string().min(8).default('Denis@Platform2025'),
    // Mail
    SMTP_HOST: zod_1.z.string().optional(),
    SMTP_PORT: zod_1.z.coerce.number().optional(),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
    EMAIL_FROM: zod_1.z.string().optional(),
    // Uploads
    UPLOAD_DIR: zod_1.z.string().default('./uploads'),
    MAX_FILE_SIZE: zod_1.z.coerce.number().default(10485760),
    // Storage Adapters
    STORAGE_PROVIDER: zod_1.z.enum(['local', 's3', 'r2', 'gcs']).default('local'),
    AWS_ACCESS_KEY_ID: zod_1.z.string().optional(),
    AWS_SECRET_ACCESS_KEY: zod_1.z.string().optional(),
    AWS_REGION: zod_1.z.string().optional(),
    AWS_BUCKET_NAME: zod_1.z.string().optional(),
    AWS_S3_CUSTOM_DOMAIN: zod_1.z.string().optional(),
    // Flutterwave
    FLW_PUBLIC_KEY: zod_1.z.string().optional(),
    FLW_SECRET_KEY: zod_1.z.string().optional(),
    FLW_ENCRYPTION_KEY: zod_1.z.string().optional(),
    FLW_WEBHOOK_SECRET: zod_1.z.string().optional(),
    // Feature Flags
    AI_VISITOR_INTELLIGENCE: zod_1.z.preprocess((val) => val === 'true' || val === '1' || val === true || val === undefined, zod_1.z.boolean()).default(true),
    AI_MEMORY_ENGINE: zod_1.z.preprocess((val) => val === 'true' || val === '1' || val === true || val === undefined, zod_1.z.boolean()).default(true),
    AI_KNOWLEDGE_ENGINE: zod_1.z.preprocess((val) => val === 'true' || val === '1' || val === true || val === undefined, zod_1.z.boolean()).default(true),
    AI_LEAD_INTELLIGENCE: zod_1.z.preprocess((val) => val === 'true' || val === '1' || val === true || val === undefined, zod_1.z.boolean()).default(true),
    AI_ADMIN_COPILOT: zod_1.z.preprocess((val) => val === 'true' || val === '1' || val === true, zod_1.z.boolean()).default(false),
    PAYMENT_DPO_ENABLED: zod_1.z.preprocess((val) => val === 'true' || val === '1' || val === true || val === undefined, zod_1.z.boolean()).default(true),
    PAYMENT_DPO_SANDBOX: zod_1.z.preprocess((val) => val === 'true' || val === '1' || val === true || val === undefined, zod_1.z.boolean()).default(true),
    WEBRTC_ENABLED: zod_1.z.preprocess((val) => val === 'true' || val === '1' || val === true, zod_1.z.boolean()).default(false),
    // Payments
    PAYMENT_PROVIDER: zod_1.z.string().default('dpo'),
    DPO_COMPANY_TOKEN: zod_1.z.string().optional(),
    DPO_SERVICE_TYPE: zod_1.z.string().optional(),
    // Debug settings
    DEBUG: zod_1.z.preprocess((val) => val === 'true' || val === '1' || val === true, zod_1.z.boolean()).default(false),
});
exports.frontendEnvSchema = zod_1.z.object({
    VITE_API_URL: zod_1.z.string().url().default('http://localhost:5000/api'),
    VITE_WS_URL: zod_1.z.string().optional()
});
