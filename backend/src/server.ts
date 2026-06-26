// src/server.ts
// Application entry point.
// Starts the HTTP server and manages graceful shutdown.

import { env } from './config/env';
import { logger } from './utils/logger';
import prisma from './config/database';
import app from './app';

const PORT = env.PORT;

async function startServer(): Promise<void> {
  try {
    // Verify database connection
    await prisma.$connect();
    logger.info('✅ Database connected successfully');

    // Start HTTP server
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`📖 Environment: ${env.NODE_ENV}`);
      logger.info(`🔒 CORS origin: ${env.FRONTEND_URL}`);
      logger.info(`🤖 Ollama endpoint: ${env.OLLAMA_URL}`);
    });

    // ── Graceful Shutdown ──────────────────────────────────────────────────
    const shutdown = async (signal: string) => {
      logger.info(`\n${signal} received — shutting down gracefully...`);
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
