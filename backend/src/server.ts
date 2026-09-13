// src/server.ts
// Application entry point. Reloaded.
// Starts the HTTP server and manages graceful shutdown.

import { env } from './config/env';
import { logger } from './utils/logger';
import prisma from './config/database';
import app from './app';
import { memoryJobService } from './ai/memory-job.service';

const PORT = env.PORT;

async function startServer(): Promise<void> {
  try {
    if (env.NODE_ENV === 'production' && env.PAYMENT_DPO_ENABLED) {
      if (env.PAYMENT_DPO_SANDBOX || !env.DPO_COMPANY_TOKEN || !env.DPO_SERVICE_TYPE) {
        throw new Error('Production payment readiness failed: live DPO credentials are required and sandbox must be disabled.');
      }
    }
    // Verify database connection
    await prisma.$connect();
    memoryJobService.start();

    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`
🚀 Denis Chamkaga Platform

Backend      ✓ Running
Frontend     ✓ Running
Database     ✓ Connected
Environment  ${env.NODE_ENV.charAt(0).toUpperCase() + env.NODE_ENV.slice(1)}
AI Model     OpenAI (${env.OPENAI_MODEL})

Frontend → ${env.FRONTEND_URL}
Backend  → http://localhost:${PORT}
`);
    });

    // ── Graceful Shutdown ──────────────────────────────────────────────────
    const shutdown = async (signal: string) => {
      logger.info(`\n${signal} received — shutting down gracefully...`);
      memoryJobService.stop();
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('✅ Database disconnected. Server closed.');
        process.exit(0);
      });

      // Force exit after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Promise Rejection:', reason);
    });

    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      process.exit(1);
    });
  } catch (err) {
    logger.error('❌ Failed to start server:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
