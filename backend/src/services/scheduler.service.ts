// backend/src/services/scheduler.service.ts
// Centralized Scheduler Service for Cron & Automation Tasks

import { otelLogger } from '../utils/otel-logger';

export interface ScheduledTaskJob {
  id: string;
  name: string;
  cronExpression: string;
  lastRunAt?: Date;
  nextRunAt?: Date;
  status: 'active' | 'paused' | 'failed';
}

class SchedulerService {
  private jobs: Map<string, ScheduledTaskJob> = new Map();

  registerJob(id: string, name: string, cronExpression: string, _handler: () => Promise<void>) {
    const job: ScheduledTaskJob = {
      id,
      name,
      cronExpression,
      status: 'active'
    };
    this.jobs.set(id, job);
    otelLogger.info(`[SchedulerService] Registered background job: ${name} (${cronExpression})`);
  }

  getJobs(): ScheduledTaskJob[] {
    return Array.from(this.jobs.values());
  }

  async triggerJobManually(id: string, handler: () => Promise<void>) {
    const job = this.jobs.get(id);
    if (!job) throw new Error(`Job ${id} not found.`);
    job.lastRunAt = new Date();
    await handler();
    otelLogger.info(`[SchedulerService] Job ${job.name} triggered manually.`);
  }
}

export const schedulerService = new SchedulerService();
