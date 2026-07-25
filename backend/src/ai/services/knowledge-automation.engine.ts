// src/ai/services/knowledge-automation.engine.ts
// Knowledge Automation Engine — pure Event Bus subscriber.
//
// This module subscribes to Knowledge events and handles automated responses.
// It does NOT import from the CRUD layer. It communicates only via aiEventBus.
//
// Architecture:
//   Domain Module → Event Bus → Automation Engine → Automation Handlers
//
// Future automation (AI summaries, expiry reminders, CRM sync) can be added
// here by adding new subscribers WITHOUT modifying the Knowledge module.

import prisma from '../../config/database';
import { aiEventBus } from '../event-bus';
import { logger } from '../../utils/logger';
import databaseKnowledgeProvider from '../providers/database-knowledge.provider';
import { runJobWithRetry, executeReviewScheduler, logAction } from './knowledge-ops.service';

// ─── Helper: write admin notification ────────────────────────────────────────

async function notifyAdmins(type: string, title: string, message: string, actionUrl = '/admin/assistant'): Promise<void> {
  try {
    const admins = await prisma.user.findMany({
      where: { role: { name: { in: ['admin', 'super_admin'] } } },
      select: { id: true }
    });
    for (const admin of admins) {
      await prisma.notification.create({
        data: { userId: admin.id, type, title, message, actionUrl }
      });
    }
  } catch (err) {
    logger.warn('[Knowledge Automation] Admin notification failed (non-fatal):', err);
  }
}

// ─── Background Lifecycle Automation checks ─────────────────────────────────

export async function runAutomationChecks(): Promise<void> {
  await runJobWithRetry('Run Review Scheduler', executeReviewScheduler, 'system_scheduler');
}

// Start automation interval every 5 minutes in dev environment
const CHECK_INTERVAL_MS = 5 * 60 * 1000;
setInterval(() => {
  logger.info('[Knowledge Automation Engine] Running periodic lifecycle checks...');
  runAutomationChecks();
}, CHECK_INTERVAL_MS);

// Run immediately on boot after 5 seconds delay to allow startup sequence completion
setTimeout(() => {
  logger.info('[Knowledge Automation Engine] Running boot-time lifecycle checks...');
  runAutomationChecks();
}, 5000);


// ─── Subscriber: KnowledgeCreated ────────────────────────────────────────────

aiEventBus.subscribe('KnowledgeCreated', async (data) => {
  try {
    logger.info(`[Knowledge Automation] KnowledgeCreated → "${data.title}" by ${data.createdBy} [source:${data.source}, status:${data.status}]`);
    await logAction(
      'KNOWLEDGE_CREATED',
      data.itemId,
      data.title,
      'crud_event',
      'success',
      `Document created by ${data.createdBy || 'Unknown'} (source: ${data.source || 'manual'}, status: ${data.status || 'published'})`
    );
  } catch (err) {
    logger.error('[Knowledge Automation] KnowledgeCreated handler error:', err);
  }
});

// ─── Subscriber: KnowledgeUpdated ────────────────────────────────────────────

aiEventBus.subscribe('KnowledgeUpdated', async (data) => {
  try {
    logger.info(`[Knowledge Automation] KnowledgeUpdated → "${data.title}" v${data.version} (${data.previousStatus} → ${data.newStatus}) by ${data.updatedBy}`);
    await logAction(
      'KNOWLEDGE_UPDATED',
      data.itemId,
      data.title,
      'crud_event',
      'success',
      `Document updated to v${data.version} (${data.previousStatus} → ${data.newStatus}) by ${data.updatedBy || 'Unknown'}`
    );

    // If status changed to review_due — notify administrators
    if (data.newStatus === 'review_due' && data.previousStatus !== 'review_due') {
      await notifyAdmins(
        'KNOWLEDGE_REVIEW_DUE',
        'Knowledge Review Required',
        `Document "${data.title}" has been marked as Review Due and requires attention.`
      );
      logger.info(`[Knowledge Automation] Admin notified: review_due for "${data.title}"`);
    }

    // If status changed to needs_update — notify administrators
    if (data.newStatus === 'needs_update' && data.previousStatus !== 'needs_update') {
      await notifyAdmins(
        'KNOWLEDGE_NEEDS_UPDATE',
        'Knowledge Needs Update',
        `Document "${data.title}" has been flagged as Needs Update.`
      );
    }
  } catch (err) {
    logger.error('[Knowledge Automation] KnowledgeUpdated handler error:', err);
  }
});

// ─── Subscriber: KnowledgeArchived ───────────────────────────────────────────

aiEventBus.subscribe('KnowledgeArchived', async (data) => {
  try {
    logger.info(`[Knowledge Automation] KnowledgeArchived → "${data.title}" by ${data.archivedBy}`);
    await logAction(
      'KNOWLEDGE_ARCHIVED',
      data.itemId,
      data.title,
      'crud_event',
      'success',
      `Document archived by ${data.archivedBy || 'System'}`
    );
  } catch (err) {
    logger.error('[Knowledge Automation] KnowledgeArchived handler error:', err);
  }
});

// ─── Subscriber: KnowledgeDuplicateDetected ───────────────────────────────────

aiEventBus.subscribe('KnowledgeDuplicateDetected', async (data) => {
  try {
    logger.warn(`[Knowledge Automation] Duplicate detected: "${data.newTitle}" is ${Math.round(data.similarityScore * 100)}% similar to item ${data.existingItemId}`);
    await logAction(
      'DUPLICATE_DETECTED',
      data.existingItemId,
      data.newTitle,
      'crud_event',
      'warning',
      `Conflicting match detected: ${Math.round(data.similarityScore * 100)}% similarity score`
    );

    await notifyAdmins(
      'KNOWLEDGE_DUPLICATE_DETECTED',
      'Duplicate Knowledge Detected',
      `A new document "${data.newTitle}" is ${Math.round(data.similarityScore * 100)}% similar to an existing published item. Please review before creating.`
    );
  } catch (err) {
    logger.error('[Knowledge Automation] KnowledgeDuplicateDetected handler error:', err);
  }
});

// ─── Subscriber: KnowledgeReindexed ──────────────────────────────────────────

aiEventBus.subscribe('KnowledgeReindexed', async (data) => {
  try {
    logger.info(`[Knowledge Automation] Full re-index completed: ${data.itemCount} item(s) by ${data.triggeredBy}`);
    await logAction(
      'KNOWLEDGE_INDEXED',
      null,
      null,
      'admin_manual',
      'success',
      `Full reindex of ${data.itemCount} published item(s) triggered by ${data.triggeredBy}`
    );
  } catch (err) {
    logger.error('[Knowledge Automation] KnowledgeReindexed handler error:', err);
  }
});

logger.info('[Knowledge Automation Engine] Initialized — subscribed to 5 knowledge event types');
