// backend/src/workflow/workflow.engine.ts
// Centralized Event-Driven Workflow Orchestrator

import { aiEventBus, AIEventType } from '../ai/event-bus';
import { logger } from '../utils/logger';
import prisma from '../config/database';
import { financeService } from '../services/finance.service';
import { businessService } from '../services/business.service';
import { supportersService } from '../services/supporters.service';

export interface WorkflowActionContext {
  event: AIEventType;
  payload: any;
  timestamp: string;
}

export interface WorkflowRule {
  id: string;
  name: string;
  eventTrigger: AIEventType;
  condition?: (ctx: WorkflowActionContext) => boolean | Promise<boolean>;
  action: (ctx: WorkflowActionContext) => Promise<void>;
}

export class WorkflowEngine {
  private rules: WorkflowRule[] = [];
  private isInitialized = false;

  constructor() {
    this.registerDefaultRules();
  }

  /**
   * Initialize Workflow Engine listeners on AIEventBus
   */
  public initialize() {
    if (this.isInitialized) return;

    const eventsToListen: AIEventType[] = [
      'LeadCreated',
      'LeadQualified',
      'AppointmentBooked',
      'VoiceCallStarted',
      'VoiceCallCompleted',
      'VoiceCallSummaryGenerated',
      'QuotationCreated',
      'QuotationApproved',
      'InvoicePaid',
      'ProjectCreated',
      'SupporterContributionPaid',
      'CollaboratorAssigned'
    ];

    for (const evt of eventsToListen) {
      aiEventBus.subscribe(evt, async (payload) => {
        await this.handleEvent(evt, payload);
      });
    }

    this.isInitialized = true;
    logger.info('[WorkflowEngine] Centralized Event-Driven Workflow Engine initialized and listening.');
  }

  /**
   * Register Default Enterprise Automation Rules
   */
  private registerDefaultRules() {
    // ── Rule 1: High Priority Lead Escalation ─────────────────────────────────────
    this.rules.push({
      id: 'RULE_LEAD_ESCALATION',
      name: 'High Priority Lead Escalation & Task Creation',
      eventTrigger: 'LeadQualified',
      condition: (ctx) => (ctx.payload?.score || 0) >= 70,
      action: async (ctx) => {
        logger.info(`[WorkflowEngine] Executing Rule RULE_LEAD_ESCALATION for lead ${ctx.payload?.email}`);
        
        // Log Business Activity
        await prisma.businessActivity.create({
          data: {
            action: 'WORKFLOW_HIGH_PRIORITY_LEAD',
            description: `Lead ${ctx.payload?.name || ctx.payload?.email} scored ${ctx.payload?.score}/100. High priority consultation task assigned to Admin.`,
            performedBy: 'WorkflowEngine',
            metadata: { lead: ctx.payload }
          }
        });

        // Trigger Notification
        const adminUser = await prisma.user.findFirst();
        if (adminUser) {
          await prisma.notification.create({
            data: {
              userId: adminUser.id,
              title: '🔥 High Priority Lead Qualified',
              message: `Lead ${ctx.payload?.name || ctx.payload?.email} scored ${ctx.payload?.score}/100. Budget: ${ctx.payload?.budget || 'N/A'}.`,
              type: 'lead_qualified',
              actionUrl: `/admin/business`
            }
          });
        }
      }
    });

    // ── Rule 2: Quotation Approval -> Project Workspace Auto-Creation ──────────────
    this.rules.push({
      id: 'RULE_QUOTE_TO_PROJECT',
      name: 'Quotation Approval Project Workspace Initialization',
      eventTrigger: 'QuotationApproved',
      action: async (ctx) => {
        const quotationId = ctx.payload?.quotationId;
        if (!quotationId) return;

        logger.info(`[WorkflowEngine] Executing Rule RULE_QUOTE_TO_PROJECT for quotation ${quotationId}`);

        try {
          const project = await businessService.convertQuotationToProject(quotationId);
          logger.info(`[WorkflowEngine] Project Workspace created (ID: ${project.id}) for quotation ${quotationId}`);
          
          await prisma.businessActivity.create({
            data: {
              action: 'WORKFLOW_PROJECT_WORKSPACE_CREATED',
              description: `Automated project workspace '${project.title}' initialized from approved quotation ${quotationId}`,
              performedBy: 'WorkflowEngine',
              metadata: { projectId: project.id, quotationId }
            }
          });
        } catch (err: any) {
          logger.error(`[WorkflowEngine] Error creating project workspace for quotation ${quotationId}: ${err.message}`);
        }
      }
    });

    // ── Rule 3: After Call Completion Automation ───────────────────────────────
    this.rules.push({
      id: 'RULE_AFTER_CALL_AUTOMATION',
      name: 'After-Call CRM & Timeline Automation',
      eventTrigger: 'VoiceCallSummaryGenerated',
      action: async (ctx) => {
        const { sessionId, summary, actionItems, sentiment, leadId } = ctx.payload;
        logger.info(`[WorkflowEngine] Executing Rule RULE_AFTER_CALL_AUTOMATION for session ${sessionId}`);

        if (leadId) {
          await prisma.lead.update({
            where: { id: leadId },
            data: {
              notes: `Call Summary: ${summary || 'N/A'}\nAction Items: ${actionItems || 'N/A'}`,
              score: Math.min(100, (ctx.payload.leadScore || 50) + 15)
            }
          });
        }

        await prisma.businessActivity.create({
          data: {
            action: 'WORKFLOW_AFTER_CALL_LOGGED',
            description: `Voice call completed. Sentiment: ${sentiment || 'neutral'}. Action items auto-extracted.`,
            performedBy: 'WorkflowEngine',
            metadata: { sessionId, summary, actionItems }
          }
        });
      }
    });

    // ── Rule 4: Payment Received -> Double-Entry General Ledger Sync ──────────────────
    this.rules.push({
      id: 'RULE_PAYMENT_LEDGER_SYNC',
      name: 'Payment Receipt & Double-Entry Ledger Sync',
      eventTrigger: 'InvoicePaid',
      action: async (ctx) => {
        const { invoiceId, amount, customerEmail } = ctx.payload;
        logger.info(`[WorkflowEngine] Executing Rule RULE_PAYMENT_LEDGER_SYNC for invoice ${invoiceId}`);

        await financeService.postJournalEntry({
          description: `Invoice Payment Settlement for ${customerEmail || 'Client'}`,
          sourceModule: 'Finance',
          eventTrigger: 'InvoicePaid',
          reference: ctx.payload?.invoiceNumber || invoiceId,
          performedBy: 'WorkflowEngine',
          lines: [
            { accountCode: '1010', type: 'DEBIT', amount: +amount, currency: 'TZS' },
            { accountCode: '1200', type: 'CREDIT', amount: +amount, currency: 'TZS' }
          ]
        });
      }
    });

    // ── Rule 5: Support Contribution Received -> Double-Entry General Ledger Sync ───────
    this.rules.push({
      id: 'RULE_SUPPORTER_CONTRIBUTION_SYNC',
      name: 'Support Contribution General Ledger Sync',
      eventTrigger: 'SupporterContributionPaid',
      action: async (ctx) => {
        const { supporterEmail, amount, tier } = ctx.payload;
        logger.info(`[WorkflowEngine] Executing Rule RULE_SUPPORTER_CONTRIBUTION_SYNC for ${supporterEmail}`);

        await financeService.postJournalEntry({
          description: `Vision Support Contribution (${tier || 'SEED'}) from ${supporterEmail || 'Supporter'}`,
          sourceModule: 'Support',
          eventTrigger: 'SupporterContributionPaid',
          performedBy: 'WorkflowEngine',
          lines: [
            { accountCode: '1010', type: 'DEBIT', amount: +amount, currency: 'TZS' },
            { accountCode: '4100', type: 'CREDIT', amount: +amount, currency: 'TZS' }
          ]
        });
      }
    });

    // ── Rule 6: Task Completed -> Unified Activity Timeline Sync ─────────────────
    this.rules.push({
      id: 'RULE_TASK_COMPLETED_TIMELINE',
      name: 'Task Completed Timeline & Notification Sync',
      eventTrigger: 'TaskCompleted',
      action: async (ctx) => {
        const { projectId, taskTitle } = ctx.payload;
        logger.info(`[WorkflowEngine] Executing Rule RULE_TASK_COMPLETED_TIMELINE for task ${taskTitle}`);

        await prisma.businessActivity.create({
          data: {
            action: 'WORKSPACE_TASK_COMPLETED',
            description: `Project Task "${taskTitle}" completed in Project Workspace (ID: ${projectId}).`,
            performedBy: 'WorkflowEngine'
          }
        });
      }
    });

    // ── Rule 7: Milestone Completed -> Unified Activity Timeline Sync ─────────────
    this.rules.push({
      id: 'RULE_MILESTONE_COMPLETED_TIMELINE',
      name: 'Milestone Completed Timeline Sync',
      eventTrigger: 'MilestoneCompleted',
      action: async (ctx) => {
        const { projectId, milestoneTitle } = ctx.payload;
        logger.info(`[WorkflowEngine] Executing Rule RULE_MILESTONE_COMPLETED_TIMELINE for milestone ${milestoneTitle}`);

        await prisma.businessActivity.create({
          data: {
            action: 'WORKSPACE_MILESTONE_COMPLETED',
            description: `Project Milestone "${milestoneTitle}" completed in Project Workspace (ID: ${projectId}).`,
            performedBy: 'WorkflowEngine'
          }
        });
      }
    });

    // ── Rule 8: File Uploaded -> DAM Asset Timeline Sync ──────────────────────────
    this.rules.push({
      id: 'RULE_FILE_UPLOADED_DAM_SYNC',
      name: 'DAM Digital Asset File Timeline Sync',
      eventTrigger: 'FileUploaded',
      action: async (ctx) => {
        const { projectId, fileName, uploadedBy } = ctx.payload;
        logger.info(`[WorkflowEngine] Executing Rule RULE_FILE_UPLOADED_DAM_SYNC for file ${fileName}`);

        await prisma.businessActivity.create({
          data: {
            action: 'DAM_ASSET_UPLOADED',
            description: `Digital Asset File "${fileName}" uploaded to Project Workspace by ${uploadedBy || 'user'}.`,
            performedBy: 'WorkflowEngine'
          }
        });
      }
    });

    // ── Rule 9: Campaign Started -> Unified Activity Timeline Sync ───────────────
    this.rules.push({
      id: 'RULE_CAMPAIGN_STARTED_TIMELINE',
      name: 'Marketing Campaign Started Timeline Sync',
      eventTrigger: 'CampaignStarted',
      action: async (ctx) => {
        const { campaignName, sentCount } = ctx.payload;
        logger.info(`[WorkflowEngine] Executing Rule RULE_CAMPAIGN_STARTED_TIMELINE for ${campaignName}`);

        await prisma.businessActivity.create({
          data: {
            action: 'MARKETING_CAMPAIGN_STARTED',
            description: `Marketing Campaign "${campaignName}" launched and dispatched to ${sentCount} recipients.`,
            performedBy: 'WorkflowEngine'
          }
        });
      }
    });
  }

  private deadLetterQueue: Array<{
    id: string;
    eventTrigger: AIEventType;
    payload: any;
    error: string;
    failedAt: Date;
    retryCount: number;
    ruleId: string;
  }> = [];

  /**
   * Internal Event Handler with DLQ & Retry Capabilities
   */
  private async handleEvent(eventTrigger: AIEventType, payload: any) {
    const ctx: WorkflowActionContext = {
      event: eventTrigger,
      payload,
      timestamp: new Date().toISOString()
    };

    const matchingRules = this.rules.filter((r) => r.eventTrigger === eventTrigger);
    for (const rule of matchingRules) {
      try {
        const shouldExecute = rule.condition ? await rule.condition(ctx) : true;
        if (shouldExecute) {
          await rule.action(ctx);
        }
      } catch (err: any) {
        logger.error(`[WorkflowEngine] Error executing rule ${rule.name}: ${err.message}`);
        this.deadLetterQueue.push({
          id: `dlq_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          eventTrigger,
          payload,
          error: err.message || 'Workflow rule execution error',
          failedAt: new Date(),
          retryCount: 0,
          ruleId: rule.id
        });
      }
    }
  }

  /**
   * Event Replay Engine for Dead Letter Queue Recovery
   */
  public async replayFailedEvent(dlqId: string) {
    const item = this.deadLetterQueue.find((i) => i.id === dlqId);
    if (!item) return false;

    item.retryCount++;
    logger.info(`[WorkflowEngine DLQ] Replaying failed event ${dlqId} (Attempt ${item.retryCount})`);

    const rule = this.rules.find((r) => r.id === item.ruleId);
    if (rule) {
      const ctx: WorkflowActionContext = {
        event: item.eventTrigger,
        payload: item.payload,
        timestamp: new Date().toISOString()
      };
      await rule.action(ctx);
      this.deadLetterQueue = this.deadLetterQueue.filter((i) => i.id !== dlqId);
      return true;
    }
    return false;
  }

  public getDLQStats() {
    return {
      queueLength: this.deadLetterQueue.length,
      failedEvents: this.deadLetterQueue
    };
  }

  /**
   * List Registered Automation Rules
   */
  public getRules() {
    return this.rules.map((r) => ({
      id: r.id,
      name: r.name,
      eventTrigger: r.eventTrigger
    }));
  }
}

export const workflowEngine = new WorkflowEngine();

