import prisma from '../config/database';
import { logger } from '../utils/logger';
import { aiExtractor } from './extractor';

const RETRY_DELAYS_MS = [5_000, 30_000, 120_000];

class MemoryJobService {
  private timer?: NodeJS.Timeout;
  private processing = false;

  async enqueue(input: { sessionId: string; conversationVersion: number; userMessage: string; assistantResponse: string }): Promise<void> {
    const idempotencyKey = `${input.sessionId}:${input.conversationVersion}`;
    await prisma.aiMemoryJob.upsert({ where: { idempotencyKey }, create: { ...input, idempotencyKey }, update: {} });
    void this.processNext();
  }

  start(): void {
    if (this.timer || process.env.AI_MEMORY_ENGINE === 'false') return;
    void prisma.aiMemoryJob.updateMany({
      where: { status: 'processing', updatedAt: { lt: new Date(Date.now() - 5 * 60_000) } },
      data: { status: 'retry', availableAt: new Date(), errorMessage: 'Worker lease expired; safely requeued' }
    });
    this.timer = setInterval(() => void this.processNext(), 5_000);
    this.timer.unref();
    void this.processNext();
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }

  async processNext(): Promise<void> {
    if (this.processing) return;
    this.processing = true;
    try {
      const job = await prisma.aiMemoryJob.findFirst({
        where: { status: { in: ['pending', 'retry'] }, availableAt: { lte: new Date() } },
        orderBy: { createdAt: 'asc' }
      });
      if (!job) return;
      const claimed = await prisma.aiMemoryJob.updateMany({
        where: { id: job.id, status: job.status },
        data: { status: 'processing', attempts: { increment: 1 }, errorMessage: null }
      });
      if (claimed.count !== 1) return;

      const session = await prisma.chatSession.findUnique({ where: { id: job.sessionId }, select: { messageCount: true } });
      if (!session || session.messageCount !== job.conversationVersion) {
        await prisma.aiMemoryJob.update({ where: { id: job.id }, data: { status: 'cancelled', processedAt: new Date(), errorMessage: 'Session deleted or conversation version changed' } });
        await prisma.businessActivity.create({ data: { action: 'AI_MEMORY_JOB_CANCELLED', description: `Memory job ${job.id} cancelled without writing stale or deleted session data.`, performedBy: 'MemoryJobService', metadata: { sessionId: job.sessionId, conversationVersion: job.conversationVersion } } });
        return;
      }

      try {
        await aiExtractor.extractContext({ ...job, conversationVersion: job.conversationVersion });
        await prisma.aiMemoryJob.update({ where: { id: job.id }, data: { status: 'completed', processedAt: new Date() } });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const attempts = job.attempts + 1;
        const terminal = message === 'MEMORY_JOB_STALE_OR_SESSION_DELETED';
        const exhausted = attempts >= job.maxAttempts;
        await prisma.aiMemoryJob.update({
          where: { id: job.id },
          data: terminal
            ? { status: 'cancelled', processedAt: new Date(), errorMessage: message }
            : exhausted
              ? { status: 'dead_letter', processedAt: new Date(), errorMessage: message }
              : { status: 'retry', errorMessage: message, availableAt: new Date(Date.now() + RETRY_DELAYS_MS[Math.min(attempts - 1, RETRY_DELAYS_MS.length - 1)]) }
        });
        if (terminal || exhausted) {
          await prisma.businessActivity.create({ data: { action: terminal ? 'AI_MEMORY_JOB_CANCELLED' : 'AI_MEMORY_JOB_DEAD_LETTER', description: `Memory job ${job.id} ended without persisting unverified facts.`, performedBy: 'MemoryJobService', metadata: { sessionId: job.sessionId, conversationVersion: job.conversationVersion, error: message } } });
        }
      }
    } catch (error) {
      logger.error('[AI Memory Worker] Queue processing failed:', error);
    } finally {
      this.processing = false;
    }
  }
}

export const memoryJobService = new MemoryJobService();
