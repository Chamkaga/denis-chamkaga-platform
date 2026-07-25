// src/ai/event-bus.ts
// Decoupled, event-driven AI platform pub/sub message broker.

import { EventEmitter } from 'events';
import { logger } from '../utils/logger';
import prisma from '../config/database';

export type AIEventMap = {
  // Visitor & Conversation Lifecycle
  VisitorCreated: { visitorId: string; sessionId: string };
  ConversationStarted: { sessionId: string; visitorId?: string };
  ConversationUpdated: { sessionId: string; messageCount: number; leadScore: number };
  ConversationCompleted: { sessionId: string; durationMs: number; leadScore: number };
  ConversationEnded: { sessionId: string; durationMs: number; feedbackRating?: number; feedbackComments?: string };
  ConsultationBooked: { consultationId: string; leadId?: string; scheduledAt: Date };
  
  // AI Cognitive Events
  IntentChanged: { sessionId: string; previousIntent: string; nextIntent: string };
  MemoryUpdated: { sessionId: string; facts: any };
  KnowledgeIndexed: { providerName: string; documentCount: number };
  AssessmentFinished: { sessionId: string; overallScore: number; priorities: string[] };
  RoadmapGenerated: { sessionId: string; industry: string; roadmapSteps: string[] };
  ConfidenceEvaluated: { sessionId: string; confidenceScore: number; confidenceLevel: string };
  GuardrailTriggered: { sessionId: string; reason: string; prompt: string };
  
  // CRM & Qualification Events
  LeadCreated: { leadId: string; name: string; email?: string; score: number };
  LeadQualified: { leadId: string; name?: string; email?: string; phone?: string; service?: string; budget?: string; score: number; urgency?: string; temperature: string };
  HandoffRequested: { sessionId: string; visitorId?: string; channel: string };
  
  // Financial & Operations
  PaymentRequested: { invoiceId: string; amount: number; txRef: string };
  PaymentCompleted: { invoiceId: string; transactionId: string; amount: number };
  QuotationCreated: { quotationId: string; amount?: number; title?: string };
  QuotationApproved: { quotationId: string; amount?: number; approvedBy?: string };
  InvoicePaid: { invoiceId: string; amount?: number; invoiceNumber?: string; customerEmail?: string };
  SupporterContributionPaid: { contributionId?: string; supporterId?: string; supporterEmail?: string; amount?: number; tier?: string };
  CampaignStarted: { campaignId: string; title?: string };
  ProjectCreated: { projectId: string; title?: string; organizationId?: string };
  MilestoneCompleted: { milestoneId: string; title?: string; projectId?: string; milestoneTitle?: string };
  TaskCompleted: { taskId: string; title?: string; projectId?: string; taskTitle?: string };
  FileUploaded: { fileId?: string; fileName?: string; projectId?: string; uploadedBy?: string };
  CollaboratorAssigned: { projectId?: string; userId?: string; role?: string };
  AppointmentBooked: { appointmentId?: string; leadId?: string; scheduledAt?: Date };
  VoiceCallStarted: { sessionId?: string; callSessionId?: string; callerName?: string };

  // Systems Actions
  ToolExecuted: { toolName: string; args: any; success: boolean };
  WorkflowAdvanced: { workflowName: string; nextStage: string };

  // Knowledge Management Events
  KnowledgeCreated: { itemId: string; title: string; status: string; source: string; createdBy: string };
  KnowledgeUpdated: { itemId: string; title: string; previousStatus: string; newStatus: string; updatedBy: string; version: number };
  KnowledgeArchived: { itemId: string; title: string; archivedBy: string };
  KnowledgeDuplicateDetected: { newTitle: string; existingItemId: string; similarityScore: number; createdBy: string };
  KnowledgeReindexed: { itemCount: number; triggeredBy: string };

  VoiceCallCompleted: {
    sessionId: string;
    callSessionId: string;
    leadId?: string;
    durationSec: number;
    status: string;
    startedAt: Date;
    endedAt: Date;
  };

  VoiceCallSummaryGenerated: {
    sessionId: string;
    callSessionId: string;
    leadId?: string;
    summary: any;
    rawNotes: string;
    leadScoreAfter?: number;
    leadScore?: number;
    actionItems?: any;
    sentiment?: string;
  };
};

export type AIEventType = keyof AIEventMap;

class AIEventBus extends EventEmitter {
  publish<K extends keyof AIEventMap>(event: K, payload: AIEventMap[K]): void {
    logger.info(`[AI EventBus] Publishing event: ${event} with data: ${JSON.stringify(payload)}`);
    this.emit(event, payload);
  }

  subscribe<K extends keyof AIEventMap>(event: K, listener: (payload: AIEventMap[K]) => void | Promise<void>): void {
    this.on(event, (data) => {
      Promise.resolve(listener(data)).catch((err) => {
        logger.error(`[AI EventBus] Error in subscriber for event ${event}:`, err);
      });
    });
  }
}

export const aiEventBus = new AIEventBus();

// --- Decoupled Platform Activity Subscribers ---

aiEventBus.subscribe('ConversationStarted', async (data) => {
  try {
    await prisma.businessActivity.create({
      data: {
        action: 'AI Chat Started',
        description: `Visitor session ${data.sessionId} initialized chat workspace.`,
        performedBy: 'ai_orchestrator',
      },
    });
  } catch (err) {
    logger.error('[AI EventBus] ConversationStarted handler failed:', err);
  }
});

aiEventBus.subscribe('LeadCreated', async (data) => {
  try {
    const adminUsers = await prisma.user.findMany({
      where: { role: { name: { in: ['admin', 'super_admin'] } } },
      select: { id: true },
    });

    for (const user of adminUsers) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'LEAD_CREATED',
          title: 'New AI Lead Generated',
          message: `Visitor "${data.name}" was captured as a lead with Score: ${data.score}%.`,
          actionUrl: `/admin/business`,
        },
      });
    }

    await prisma.businessActivity.create({
      data: {
        action: 'CRM Lead Created',
        description: `New CRM Lead "${data.name}" was registered via AI coordination. Score: ${data.score}%.`,
        performedBy: 'ai_orchestrator',
      },
    });
  } catch (err) {
    logger.error('[AI EventBus] LeadCreated handler failed:', err);
  }
});

aiEventBus.subscribe('LeadQualified', async (data) => {
  try {
    await prisma.businessActivity.create({
      data: {
        action: 'CRM Lead Qualified',
        description: `Lead "${data.name || data.email}" qualified as a ${(data.temperature || 'warm').toUpperCase()} lead.`,
        performedBy: 'ai_orchestrator',
      },
    });

    const admins = await prisma.user.findMany({
      where: { role: { name: { in: ['admin', 'super_admin'] } } },
      select: { id: true },
    });

    for (const user of admins) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'CRM_TASK',
          title: `Follow-up Task: Call Qualified Lead`,
          message: `Action required: Follow up with qualified ${data.temperature} lead "${data.name}" (Score: ${data.score}%).`,
          actionUrl: `/admin/leads`,
        },
      });

      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'REMINDER',
          title: `Lead Qualification Reminder`,
          message: `Reminder: Check CRM details and context requirements for lead "${data.name}".`,
          actionUrl: `/admin/leads`,
        },
      });
    }

    await prisma.analytics.create({
      data: {
        eventType: 'LEAD_QUALIFIED_WORKFLOW',
        eventData: { leadId: data.leadId, name: data.name, score: data.score, temperature: data.temperature }
      }
    });
  } catch (err) {
    logger.error('[AI EventBus] LeadQualified handler failed:', err);
  }
});

aiEventBus.subscribe('ConsultationBooked', async (data: any) => {
  try {
    await prisma.businessActivity.create({
      data: {
        action: 'Consultation Booked',
        description: `Consultation schedule requested for lead/org at ${new Date(data.scheduledAt).toLocaleString()}`,
        performedBy: 'ai_orchestrator',
      },
    });

    const admins = await prisma.user.findMany({
      where: { role: { name: { in: ['admin', 'super_admin'] } } },
      select: { id: true },
    });

    for (const user of admins) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'CRM_TASK',
          title: `Follow-up Task: Prepare for Consultation`,
          message: `Action required: Prepare client proposal materials for consultation meeting scheduled at ${new Date(data.scheduledAt).toLocaleString()}.`,
          actionUrl: `/admin/appointments`,
        },
      });

      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'REMINDER',
          title: `Consultation Reminder`,
          message: `Reminder: Live meeting scheduled at ${new Date(data.scheduledAt).toLocaleString()}.`,
          actionUrl: `/admin/appointments`,
        },
      });
    }

    await prisma.analytics.create({
      data: {
        eventType: 'CONSULTATION_BOOKED_WORKFLOW',
        eventData: { consultationId: data.consultationId, leadId: data.leadId, scheduledAt: data.scheduledAt }
      }
    });
  } catch (err) {
    logger.error('[AI EventBus] ConsultationBooked handler failed:', err);
  }
});

aiEventBus.subscribe('ConversationEnded', async (data) => {
  try {
    await prisma.businessActivity.create({
      data: {
        action: 'AI Chat Closed',
        description: `Visitor session ${data.sessionId} has closed. Review score: ${data.feedbackRating || 'N/A'} stars.`,
        performedBy: 'ai_orchestrator',
      },
    });
  } catch (err) {
    logger.error('[AI EventBus] ConversationEnded handler failed:', err);
  }
});

// Import services dynamically to resolve cyclic imports
aiEventBus.subscribe('ConversationCompleted', async (data) => {
  try {
    const { leadIntelligenceService } = await import('./services/lead-intelligence.service');
    const { aiMemory } = await import('./memory');

    const session = await prisma.chatSession.findUnique({
      where: { id: data.sessionId },
      select: { leadId: true }
    });

    if (session && session.leadId) {
      const facts = await aiMemory.getFacts(data.sessionId);
      const totalMsgCount = await prisma.aiConversation.count({ where: { sessionId: data.sessionId } });
      const grade = leadIntelligenceService.evaluate(facts, 'Service Request', totalMsgCount);
      const summary = leadIntelligenceService.compileSummary(facts, grade);
      const summaryText = leadIntelligenceService.formatTextSummary(summary);

      await prisma.lead.update({
        where: { id: session.leadId },
        data: {
          score: grade.score,
          temperature: grade.temperature,
          requirements: summaryText
        }
      });
      await prisma.analytics.create({
        data: {
          eventType: 'CONVERSATION_COMPLETED_WORKFLOW',
          eventData: { sessionId: data.sessionId, leadId: session.leadId, score: grade.score, temperature: grade.temperature }
        }
      });
      logger.info(`[CRM Event Sync] Automatically updated CRM Lead ${session.leadId} with structured business intelligence.`);
    }
  } catch (err) {
    logger.error('[AI EventBus] ConversationCompleted CRM update failed:', err);
  }
});

aiEventBus.subscribe('VoiceCallCompleted', async (data) => {
  try {
    const { automationEngine } = await import('./services/automation.engine');
    await automationEngine.execute('VoiceCallCompleted', data);
  } catch (err) {
    logger.error('[AI EventBus] VoiceCallCompleted handler failed:', err);
  }
});

aiEventBus.subscribe('VoiceCallSummaryGenerated', async (data) => {
  try {
    const { automationEngine } = await import('./services/automation.engine');
    await automationEngine.execute('VoiceCallSummaryGenerated', data);
  } catch (err) {
    logger.error('[AI EventBus] VoiceCallSummaryGenerated handler failed:', err);
  }
});
