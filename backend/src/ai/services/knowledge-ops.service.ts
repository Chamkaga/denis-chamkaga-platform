// src/ai/services/knowledge-ops.service.ts
// Knowledge Operations & Monitoring Service
//
// Manages centralized automation background jobs, logs audit history,
// monitors engine health metrics, executes tasks with retry-exponential-backoff,
// and implements manual triggers.

import prisma from '../../config/database';
import { logger } from '../../utils/logger';
import { aiEventBus } from '../event-bus';
import databaseKnowledgeProvider from '../providers/database-knowledge.provider';
import { calculateQualityScore, generateAutoTags, jaccardSimilarity } from './knowledge-pipeline.service';

export interface AuditLogPayload {
  action: string;
  itemId?: string | null;
  itemTitle?: string | null;
  trigger: string;
  result: 'success' | 'warning' | 'failed';
  details?: string | null;
}

// ─── 1. Write Audit Log Helper ──────────────────────────────────────────────

export async function logAction(
  action: string,
  itemId: string | null,
  itemTitle: string | null,
  trigger: string,
  result: 'success' | 'warning' | 'failed',
  details?: string | null
): Promise<void> {
  try {
    await prisma.aiKnowledgeAuditLog.create({
      data: {
        action,
        itemId,
        itemTitle,
        trigger,
        result,
        details
      }
    });
  } catch (err) {
    logger.error('[Knowledge Ops] Failed to write audit log:', err);
  }
}

// Helper to convert Job Name to Audit Action
function jobNameToEvent(jobName: string): string {
  switch (jobName) {
    case 'Rebuild Search Index': return 'KNOWLEDGE_INDEXED';
    case 'Run Duplicate Scan': return 'DUPLICATE_DETECTED';
    case 'Recalculate Quality': return 'QUALITY_RECALCULATED';
    case 'Regenerate Tags': return 'TAGS_REGENERATED';
    case 'Refresh Relationships': return 'RELATIONSHIPS_UPDATED';
    case 'Run Review Scheduler': return 'REVIEW_SCHEDULED';
    default: return 'JOB_EXECUTED';
  }
}

// ─── 2. Retry & Recovery Wrapper (Exponential Backoff) ───────────────────────

export async function runJobWithRetry(
  jobName: string,
  taskFn: () => Promise<number>,
  trigger = 'system_scheduler'
): Promise<void> {
  const startTime = Date.now();
  let retryCount = 0;
  const maxRetries = 3;
  let success = false;
  let lastError: Error | null = null;
  let processedDocs = 0;

  // Set running state in Job Registry
  await prisma.aiKnowledgeJob.upsert({
    where: { name: jobName },
    update: { status: 'running', retryCount: 0, errorMessage: null, lastRun: new Date() },
    create: { name: jobName, status: 'running', retryCount: 0 }
  });

  while (retryCount <= maxRetries && !success) {
    try {
      if (retryCount > 0) {
        logger.info(`[Knowledge Ops] Retrying job "${jobName}" (Attempt ${retryCount}/${maxRetries})...`);
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      processedDocs = await taskFn();
      success = true;
    } catch (err: any) {
      lastError = err;
      retryCount++;
      logger.warn(`[Knowledge Ops] Job "${jobName}" failed (Attempt ${retryCount}/${maxRetries}): ${err.message}`);
    }
  }

  const duration = Date.now() - startTime;

  if (success) {
    await prisma.aiKnowledgeJob.update({
      where: { name: jobName },
      data: {
        status: 'completed',
        processedDocs,
        duration,
        retryCount: Math.max(0, retryCount - 1),
        lastRun: new Date(),
        nextRun: new Date(Date.now() + 10 * 60 * 1000) // Next run in 10 minutes
      }
    });

    await logAction(
      jobNameToEvent(jobName),
      null,
      null,
      trigger,
      'success',
      `Processed ${processedDocs} document(s) successfully in ${duration}ms.`
    );
  } else {
    const errorMsg = lastError?.message || 'Unknown automation error';
    await prisma.aiKnowledgeJob.update({
      where: { name: jobName },
      data: {
        status: 'failed',
        duration,
        retryCount: maxRetries,
        errorMessage: errorMsg,
        lastRun: new Date(),
        nextRun: new Date(Date.now() + 15 * 60 * 1000) // Retry in 15 minutes
      }
    });

    await logAction(
      jobNameToEvent(jobName),
      null,
      null,
      trigger,
      'failed',
      `Failed after ${maxRetries} retries: ${errorMsg}`
    );

    // Notify administrators of retry exhaustion
    try {
      const admins = await prisma.user.findMany({
        where: { role: { name: { in: ['admin', 'super_admin'] } } },
        select: { id: true }
      });
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            type: 'KNOWLEDGE_JOB_FAILED',
            title: `Automation Job "${jobName}" Failed`,
            message: `Background job failed after retry exhaustion: ${errorMsg}`,
            actionUrl: '/admin/assistant'
          }
        });
      }
    } catch (notifyErr) {
      logger.error('[Knowledge Ops] Failed to write admin failure notifications:', notifyErr);
    }
  }
}

// ─── 3. Manual Tasks Implementation ──────────────────────────────────────────

// Task: Rebuild index
export async function executeRebuildIndex(): Promise<number> {
  databaseKnowledgeProvider.clearCache();
  // Read cache force loads cache
  const docs = await databaseKnowledgeProvider.retrieve('', 1);
  // Mark index status on items
  const items = await prisma.aiKnowledgeItem.findMany({ where: { status: 'published' } });
  for (const item of items) {
    await prisma.aiKnowledgeItem.update({
      where: { id: item.id },
      data: { indexStatus: 'indexed', lastIndexedAt: new Date() }
    });
  }
  return items.length;
}

// Task: Recalculate Quality Score
export async function executeRecalculateQuality(): Promise<number> {
  const items = await prisma.aiKnowledgeItem.findMany();
  for (const item of items) {
    const qualityScore = calculateQualityScore({
      title: item.title,
      content: item.content,
      status: item.status,
      source: item.source,
      category: item.category,
      reviewInterval: item.reviewInterval,
      validUntil: item.validUntil,
      relationships: item.relationships,
      tags: item.tags
    });
    await prisma.aiKnowledgeItem.update({
      where: { id: item.id },
      data: { qualityScore }
    });
  }
  return items.length;
}

// Task: Regenerate Classification Tags
export async function executeRegenerateTags(): Promise<number> {
  const items = await prisma.aiKnowledgeItem.findMany();
  for (const item of items) {
    const tags = generateAutoTags(item.title, item.content);
    await prisma.aiKnowledgeItem.update({
      where: { id: item.id },
      data: { tags }
    });
  }
  return items.length;
}

// Task: Refresh Relationships
export async function executeRefreshRelationships(): Promise<number> {
  // Scans all documents and validates JSON mapping IDs
  const items = await prisma.aiKnowledgeItem.findMany();
  const allIds = new Set(items.map(i => i.id));
  let updatedCount = 0;
  for (const item of items) {
    if (Array.isArray(item.relationships)) {
      const validRels = (item.relationships as string[]).filter(id => allIds.has(id));
      if (validRels.length !== (item.relationships as string[]).length) {
        await prisma.aiKnowledgeItem.update({
          where: { id: item.id },
          data: { relationships: validRels }
        });
        updatedCount++;
      }
    }
  }
  return updatedCount;
}

// Task: Run Duplicate Scan
export async function executeDuplicateScan(): Promise<number> {
  const items = await prisma.aiKnowledgeItem.findMany({
    where: { status: 'published' }
  });
  let scanCount = 0;
  for (let i = 0; i < items.length; i++) {
    let maxSimilarity = 0;
    for (let j = 0; j < items.length; j++) {
      if (i === j) continue;
      const sim = jaccardSimilarity(
        `${items[i].title} ${items[i].content}`,
        `${items[j].title} ${items[j].content}`
      );
      if (sim > maxSimilarity) maxSimilarity = sim;
    }
    await prisma.aiKnowledgeItem.update({
      where: { id: items[i].id },
      data: { duplicateScore: maxSimilarity }
    });
    scanCount++;
  }
  return scanCount;
}

// Task: Run Review Scheduler & Expiry
export async function executeReviewScheduler(): Promise<number> {
  const now = new Date();
  let modifiedCount = 0;

  // 1. Mark expired
  const expiredItems = await prisma.aiKnowledgeItem.findMany({
    where: { status: 'published', validUntil: { lt: now } }
  });
  for (const item of expiredItems) {
    await prisma.aiKnowledgeItem.update({
      where: { id: item.id },
      data: { status: 'archived' }
    });
    await logAction('DOCUMENT_EXPIRED', item.id, item.title, 'system_scheduler', 'success', 'Document archived due to validUntil expiration.');
    modifiedCount++;
  }

  // 2. Mark review-due
  const reviewDueItems = await prisma.aiKnowledgeItem.findMany({
    where: { status: 'published', nextReviewAt: { lte: now } }
  });
  for (const item of reviewDueItems) {
    await prisma.aiKnowledgeItem.update({
      where: { id: item.id },
      data: { status: 'needs_review' }
    });
    await logAction('REVIEW_SCHEDULED', item.id, item.title, 'system_scheduler', 'warning', 'Document marked needs_review due to elapsed review schedule.');
    modifiedCount++;
  }

  if (modifiedCount > 0) {
    databaseKnowledgeProvider.clearCache();
  }
  return modifiedCount;
}

// ─── 4. Health Dashboard Aggregation ─────────────────────────────────────────

export async function getHealthDashboard() {
  const jobs = await prisma.aiKnowledgeJob.findMany();
  const failedJobsCount = jobs.filter(j => j.status === 'failed').length;

  const checkJob = (name: string) => {
    const job = jobs.find(j => j.name === name);
    if (!job) return 'Healthy';
    if (job.status === 'failed') return 'Failed';
    if (job.retryCount > 0) return 'Warning';
    return 'Healthy';
  };

  // Determine subcomponents health
  return {
    pipeline: failedJobsCount > 0 ? 'Warning' : 'Healthy',
    indexer: checkJob('Rebuild Search Index'),
    scheduler: checkJob('Run Review Scheduler'),
    tagGenerator: checkJob('Regenerate Tags'),
    duplicateEngine: checkJob('Run Duplicate Scan'),
    qualityEngine: checkJob('Recalculate Quality'),
    reviewEngine: checkJob('Run Review Scheduler')
  };
}

// ─── 5. Metrics Aggregation ──────────────────────────────────────────────────

export async function getOpsMetrics() {
  const [totalDocs, publishedDocs, awaitingReviewDocs, expiredDocs, failedIndexes] = await Promise.all([
    prisma.aiKnowledgeItem.count(),
    prisma.aiKnowledgeItem.count({ where: { status: 'published' } }),
    prisma.aiKnowledgeItem.count({ where: { status: 'needs_review' } }),
    prisma.aiKnowledgeItem.count({ where: { validUntil: { lt: new Date() } } }),
    prisma.aiKnowledgeItem.count({ where: { indexStatus: 'failed' } })
  ]);

  const aggQuality = await prisma.aiKnowledgeItem.aggregate({
    _avg: { qualityScore: true }
  });
  const averageQualityScore = Math.round(aggQuality._avg.qualityScore || 0);

  // Retrieve jobs to evaluate success rate
  const jobs = await prisma.aiKnowledgeJob.findMany();
  const totalRuns = jobs.length;
  const failedRuns = jobs.filter(j => j.status === 'failed').length;
  const successRuns = totalRuns - failedRuns;
  
  const automationSuccessRate = totalRuns > 0 ? Math.round((successRuns / totalRuns) * 100) : 100;
  const automationFailureRate = totalRuns > 0 ? Math.round((failedRuns / totalRuns) * 100) : 0;

  // Average processing time from indexing jobs
  const indexJob = jobs.find(j => j.name === 'Rebuild Search Index');
  const averageIndexingTime = indexJob ? indexJob.duration : 120; // default 120ms if never run

  const duplicateScoreAgg = await prisma.aiKnowledgeItem.aggregate({
    _avg: { duplicateScore: true }
  });
  const duplicateDetectionRate = Math.round((duplicateScoreAgg._avg.duplicateScore || 0) * 100);

  return {
    totalDocs,
    publishedDocs,
    awaitingReviewDocs,
    expiredDocs,
    failedIndexes,
    averageQualityScore,
    averageIndexingTime,
    duplicateDetectionRate,
    automationSuccessRate,
    automationFailureRate
  };
}
