# Denis Chamkaga Platform – Environment Setup Guide

## Prerequisites

- **Node.js**: v20.x LTS or higher
- **npm**: v10.x or higher
- **PostgreSQL**: v15.x or higher
- **Redis**: v7.x or higher
- **Docker & Docker Compose** (for containerized deployment)

---

## Environment Variable Configuration (`.env`)

Create a `.env` file in the workspace root:

```env
# Server Core Settings
NODE_ENV=production
PORT=5000
API_PREFIX=/api
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,https://denischamkaga.com

# Database Connection String
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dc_platform?schema=public

# Redis Connection String
REDIS_URL=redis://localhost:6379

# JWT Authentication Secrets
JWT_SECRET=super_secret_jwt_key_denis_chamkaga_2025_prod_secure
JWT_EXPIRATION=15m
REFRESH_TOKEN_SECRET=super_secret_refresh_token_key_denis_chamkaga_2025_prod_secure
REFRESH_TOKEN_EXPIRATION=7d

# Mary AI Engine Credentials
OPENAI_API_KEY=sk-proj-your-openai-api-key-here
LLM_PROVIDER=openai
DEFAULT_MODEL=gpt-4o-mini
CONFIDENCE_THRESHOLD=0.75

# Storage Engine (Local / AWS S3)
STORAGE_DRIVER=local
UPLOAD_DIR=./uploads

# Payment Gateway Keys
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxxxxx-X
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxxxxx-X
FLUTTERWAVE_ENCRYPTION_KEY=FLWSECK_TESTxxxx

# SMTP Email Dispatch
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=info@denischamkaga.com
SMTP_PASS=app_specific_password_here
SMTP_FROM="Denis Chamkaga Platform" <info@denischamkaga.com>
```

---

## Database Initialization Commands

```bash
# Install workspace dependencies
npm install

# Run database schema migrations
npx prisma migrate deploy --schema=backend/prisma/schema.prisma

# Generate Prisma Client
npx prisma generate --schema=backend/prisma/schema.prisma

# Seed 17 Knowledge Domains & 9 System User Accounts
npx tsx backend/src/scripts/seed-production-accounts.ts
npx tsx backend/src/scripts/verify-phase6-production-certification.ts
```
