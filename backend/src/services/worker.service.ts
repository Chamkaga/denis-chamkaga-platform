// backend/src/services/worker.service.ts
// Centralized Background Worker Infrastructure Service

import { logger } from '../utils/logger';
import { aiEventBus } from '../ai/event-bus';

export interface BackgroundJob {
  id: string;
  type: string;
  payload: any;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  attempts: number;
  maxAttempts: number;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export class WorkerService {
  private queue: BackgroundJob[] = [];
  private isProcessing = false;

  constructor() {
    this.startLoop();
  }

  public enqueueJob(type: string, payload: any, maxAttempts = 3): BackgroundJob {
    const job: BackgroundJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      type,
      payload,
      status: 'queued',
      attempts: 0,
      maxAttempts,
      createdAt: new Date()
    };

    this.queue.push(job);
    logger.info(`[WorkerService] Enqueued background job ${job.id} (${type})`);
    return job;
  }

  public getQueueStats() {
    return {
      totalQueued: this.queue.filter((j) => j.status === 'queued').length,
      totalProcessing: this.queue.filter((j) => j.status === 'processing').length,
      totalCompleted: this.queue.filter((j) => j.status === 'completed').length,
      totalFailed: this.queue.filter((j) => j.status === 'failed').length,
      queueLength: this.queue.length
    };
  }

  private async startLoop() {
    setInterval(async () => {
      if (this.isProcessing) return;
      this.isProcessing = true;

      const nextJob = this.queue.find((j) => j.status === 'queued');
      if (nextJob) {
        nextJob.status = 'processing';
        nextJob.attempts++;

        try {
          logger.info(`[WorkerService] Processing background job ${nextJob.id} (${nextJob.type})`);
          await this.executeJobLogic(nextJob);

          nextJob.status = 'completed';
          nextJob.completedAt = new Date();
          logger.info(`[WorkerService] Completed background job ${nextJob.id}`);
        } catch (err: any) {
          nextJob.error = err.message;
          if (nextJob.attempts < nextJob.maxAttempts) {
            nextJob.status = 'queued'; // Re-queue for retry
            logger.warn(`[WorkerService] Retrying job ${nextJob.id} (Attempt ${nextJob.attempts}/${nextJob.maxAttempts})`);
          } else {
            nextJob.status = 'failed';
            logger.error(`[WorkerService] Job ${nextJob.id} failed permanently: ${err.message}`);
          }
        }
      }

      this.isProcessing = false;
    }, 1000);
  }

  private async executeJobLogic(job: BackgroundJob) {
    // Execute worker logic off HTTP thread
    switch (job.type) {
      case 'EMAIL_DISPATCH':
      case 'MARKETING_BROADCAST':
      case 'REPORT_GENERATION':
      case 'SYSTEM_BACKUP':
      default:
        await new Promise((r) => setTimeout(r, 200)); // Simulated worker payload execution
        break;
    }
  }
}

export const workerService = new WorkerService();
