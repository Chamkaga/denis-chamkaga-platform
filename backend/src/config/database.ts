// src/config/database.ts
// Prisma Client singleton — one shared instance across the entire application.
// Prevents connection pool exhaustion during development hot-reloads.

import { PrismaClient } from '@prisma/client';
import { env } from './env';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? ['warn', 'error']
        : ['warn', 'error'],
  });

// Centralized RAG Cache Invalidation Middleware
// Automatically clears the cached knowledge base documents on any content table updates.
prisma.$use(async (params, next) => {
  const result = await next(params);

  const contentModels = [
    'Project',
    'Service',
    'BlogPost',
    'Experience',
    'Education',
    'Certificate',
    'Faq',
    'Gallery',
    'SiteSetting'
  ];
  const writeActions = ['create', 'createMany', 'update', 'updateMany', 'upsert', 'delete', 'deleteMany'];

  if (params.model && contentModels.includes(params.model) && writeActions.includes(params.action)) {
    // Dynamically import knowledgeService to prevent circular dependencies
    import('../ai/services/knowledge.service')
      .then(m => m.knowledgeService.clearCache())
      .catch(err => console.error('Failed to clear knowledge cache on write:', err));
  }

  return result;
});

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
