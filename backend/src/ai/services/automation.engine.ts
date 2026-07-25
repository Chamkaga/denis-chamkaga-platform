// backend/src/ai/services/automation.engine.ts
// Decoupled enterprise rules and action engine for CRM automations.

import prisma from '../../config/database';
import { logger } from '../../utils/logger';
import { leadIntelligenceService } from './lead-intelligence.service';
import { aiMemory } from '../memory';
import { MockTranscriptionProvider } from '../providers/transcription.provider';

export interface AutomationRule {
  name: string;
  trigger: string;
  conditions: (payload: any) => boolean;
  actions: (payload: any) => Promise<void>;
}

class AutomationEngine {
  private rules: AutomationRule[] = [];
  private transcriptionProvider = new MockTranscriptionProvider();

  constructor() {
    this.initializeRules();
  }

  private initializeRules() {
    // Rule 1: CRM Voice Call Logging & Activity Creation
    this.rules.push({
      name: 'CRM Activity Logger',
      trigger: 'VoiceCallCompleted',
      conditions: () => true,
      actions: async (payload) => {
        const session = await prisma.callSession.findUnique({
          where: { id: payload.callSessionId },
          include: { lead: true }
        });
        if (!session) return;

        const summaryData = session.summary ? JSON.parse(session.summary) : {};

        // Create structured BusinessActivity CRM record
        await prisma.businessActivity.create({
          data: {
            action: 'Voice Call Completed',
            description: `Voice call session completed. Duration: ${payload.durationSec}s. Status: ${payload.status}.`,
            performedBy: 'automation_engine',
            metadata: {
              type: 'VOICE_CALL',
              status: payload.status,
              duration: payload.durationSec,
              caller: session.callerName,
              receiver: session.receiverName,
              summary: summaryData.needs || 'No needs summarized',
              nextAction: summaryData.nextAction || 'None scheduled',
              createdBy: 'crm_system'
            } as any
          }
        });
      }
    });

    // Rule 2: Lead Intelligence & Memory Synchronization
    this.rules.push({
      name: 'Lead Intelligence Evaluator',
      trigger: 'VoiceCallCompleted',
      conditions: (payload) => payload.status === 'completed',
      actions: async (payload) => {
        const session = await prisma.callSession.findUnique({
          where: { id: payload.callSessionId }
        });
        if (!session) return;

        const chatSession = await prisma.chatSession.findUnique({
          where: { id: payload.sessionId },
          select: { leadId: true, visitorId: true }
        });
        if (!chatSession) return;

        // Fetch aggregated memory facts
        const facts = await aiMemory.getFacts(payload.sessionId);
        const totalMsgCount = await prisma.aiConversation.count({ where: { sessionId: payload.sessionId } });

        // Recalculate lead score and temperature
        const grade = leadIntelligenceService.evaluate(facts, 'consultation', totalMsgCount);
        
        // Dynamic Boost: +25 if the voice call is completed and active for 10+ seconds
        let finalScore = grade.score;
        if (payload.durationSec >= 10) {
          finalScore = Math.min(finalScore + 25, 100);
        }

        let temperature = grade.temperature;
        if (finalScore >= 61) {
          temperature = 'hot';
        } else if (finalScore >= 31) {
          temperature = 'warm';
        }

        // Generate structured AI Summary in JSON format
        const structuredSummary = {
          customerName: session.callerName,
          company: facts.company || 'Unknown Company',
          needs: facts.challenges || 'Business bit-normalizations and CRM/ERP consultation',
          painPoints: facts.challenges || 'Slow operations, manual workflow controls',
          budget: facts.budget || 'Not specified',
          timeline: facts.timeline || 'Not specified',
          objections: 'None noted',
          nextAction: session.nextAction || 'Follow up next week',
          sentiment: 'positive',
          probability: finalScore >= 61 ? 0.85 : 0.5,
          recommendedService: 'Enterprise Relational Systems & CRM'
        };

        // Save back to CallSession Customer Interaction Record (CIR)
        await prisma.callSession.update({
          where: { id: session.id },
          data: {
            leadScoreAfter: finalScore,
            summary: JSON.stringify(structuredSummary),
            sentiment: 'positive',
            actionItems: structuredSummary.nextAction
          }
        });

        // Update Lead score and temperature in database
        if (chatSession.leadId) {
          await prisma.lead.update({
            where: { id: chatSession.leadId },
            data: {
              score: finalScore,
              temperature,
              notes: `Last voice call duration: ${payload.durationSec}s. Notes: ${session.denisNotes || 'None'}`
            }
          });

          // Sync Memory: Save this summarized context back to visitor's memory facts
          const newFacts = {
            ...facts,
            goals: `Last discussion: Stated needs for ${structuredSummary.needs}`,
            challenges: structuredSummary.painPoints,
            visitorProfile: finalScore >= 61 ? 'Registered Company' as const : facts.visitorProfile
          };
          await aiMemory.saveFacts(payload.sessionId, newFacts);
        }

        // Log Analytics Event
        await prisma.analytics.create({
          data: {
            eventType: 'voice_call_completed',
            sessionId: payload.sessionId,
            visitorId: chatSession.visitorId,
            eventData: {
              callSessionId: session.id,
              durationSec: payload.durationSec,
              scoreBefore: session.leadScoreBefore,
              scoreAfter: finalScore,
              temperature
            }
          }
        });
      }
    });

    // Rule 3: Admin Escalation & Follow-up Task Reminders
    this.rules.push({
      name: 'Admin Call Task Generator',
      trigger: 'VoiceCallCompleted',
      conditions: (payload) => payload.status === 'completed' || payload.status === 'missed',
      actions: async (payload) => {
        const session = await prisma.callSession.findUnique({
          where: { id: payload.callSessionId }
        });
        if (!session) return;

        const admins = await prisma.user.findMany({
          where: { role: { name: { in: ['admin', 'super_admin'] } } },
          select: { id: true }
        });

        const title = payload.status === 'completed' 
          ? `Follow-up Task: Call with ${session.callerName}`
          : `Missed Call from ${session.callerName}`;

        const message = payload.status === 'completed'
          ? `Action Required: Review Denis' notes and prepare follow-up proposal for ${session.callerName}. Duration: ${payload.durationSec}s.`
          : `Denis: You missed a voice call from visitor ${session.callerName} at ${new Date(payload.endedAt).toLocaleTimeString()}.`;

        for (const user of admins) {
          await prisma.notification.create({
            data: {
              userId: user.id,
              type: 'CRM_TASK',
              title,
              message,
              actionUrl: `/admin/leads`
            }
          });
        }
      }
    });

    // Rule 4: Structured CRM Summary & Memory Syncer
    this.rules.push({
      name: 'CRM Summary & Memory Syncer',
      trigger: 'VoiceCallSummaryGenerated',
      conditions: () => true,
      actions: async (payload) => {
        const db = (await import('../../config/database')).default;
        const chatSession = await db.chatSession.findUnique({
          where: { id: payload.sessionId },
          select: { leadId: true, visitorId: true }
        });
        if (!chatSession) return;

        const summary = payload.summary;
        const temp = payload.leadScoreAfter >= 61 ? 'hot' : payload.leadScoreAfter >= 31 ? 'warm' : 'cold';

        // 1. Update Lead Record
        if (chatSession.leadId) {
          await db.lead.update({
            where: { id: chatSession.leadId },
            data: {
              score: payload.leadScoreAfter,
              temperature: temp,
              status: 'qualified',
              notes: `[Voice Call Notes]\n${payload.rawNotes}\n\n[AI Profile]\n${summary.customerProfile}`,
              requirements: `Needs: ${summary.businessNeeds}\nPain Points: ${summary.painPoints}\nBudget: ${summary.budget}\nTimeline: ${summary.timeline}\nClosing Probability: ${summary.probabilityOfClosing}`
            }
          });

          // 2. Sync visitor memory facts
          const { aiMemory } = await import('../memory');
          const existingFacts = await aiMemory.getFacts(payload.sessionId);
          const newFacts = {
            ...existingFacts,
            company: summary.customerProfile.split(' - ')[0] || existingFacts.company,
            budget: summary.budget,
            timeline: summary.timeline,
            goals: summary.businessNeeds,
            challenges: summary.painPoints,
            interests: summary.recommendedService
          };
          await aiMemory.saveFacts(payload.sessionId, newFacts);
        }

        // 3. Log Structured CRM Activity Timeline Event
        await db.businessActivity.create({
          data: {
            action: 'CRM Summary Generated',
            description: `AI converted voice call notes for session ${payload.sessionId} into structured intelligence. Recommended: ${summary.recommendedService}. Next action: ${summary.nextAction}.`,
            performedBy: 'crm_system',
            metadata: {
              type: 'CRM_SUMMARY',
              sessionId: payload.sessionId,
              callSessionId: payload.callSessionId,
              probability: summary.probabilityOfClosing,
              risks: summary.risks,
              objections: summary.objections
            } as any
          }
        });

        // 4. Create Follow-up Task Notification for Denis
        const admins = await db.user.findMany({
          where: { role: { name: { in: ['admin', 'super_admin'] } } },
          select: { id: true }
        });

        for (const user of admins) {
          await db.notification.create({
            data: {
              userId: user.id,
              type: 'CRM_TASK',
              title: `Task: Follow Up on CRM Summary`,
              message: `Next Action: ${summary.nextAction}. Objections: ${summary.objections}. Plan: ${summary.followUpPlan}`,
              actionUrl: `/admin/business`
            }
          });
        }
      }
    });

    // Rule 5: Whisper Transcription Mock Pipeline (Decoupled Abstraction)
    this.rules.push({
      name: 'Whisper Transcription Mock Pipeline',
      trigger: 'VoiceCallCompleted',
      conditions: (payload) => payload.status === 'completed',
      actions: async (payload) => {
        const db = (await import('../../config/database')).default;
        
        // Find session to see caller name and lead details
        const session = await db.callSession.findUnique({
          where: { id: payload.callSessionId },
          include: { lead: true }
        });
        if (!session) return;

        // Set status to processing
        await db.callSession.update({
          where: { id: session.id },
          data: {
            recordingStatus: 'processing',
            transcriptStatus: 'processing'
          }
        });

        // Process audio recording via the Isolated Transcription Service Abstraction
        setTimeout(async () => {
          try {
            const lead = session.lead;
            const transcriptionResult = await this.transcriptionProvider.transcribe(
              `/recordings/call_${session.sessionId}.mp3`,
              {
                companyName: lead?.company || undefined,
                requirements: lead?.requirements || undefined
              }
            );

            await db.callSession.update({
              where: { id: session.id },
              data: {
                recordingStatus: 'completed',
                recordingUrl: `/recordings/call_${session.sessionId}.mp3`,
                transcriptStatus: 'completed',
                transcript: transcriptionResult.text
              }
            });
            logger.info(`[Whisper Pipeline] Transcription completed using provider [${transcriptionResult.provider}] for callSession: ${session.id}`);
          } catch (err) {
            logger.error('[Whisper Pipeline] Transcription service failure:', err);
          }
        }, 1000); // 1-second simulation delay
      }
    });
  }

  async execute(trigger: string, payload: any) {
    logger.info(`[AutomationEngine] Running automation trigger: ${trigger}`);
    const matching = this.rules.filter(r => r.trigger === trigger);
    for (const rule of matching) {
      if (rule.conditions(payload)) {
        try {
          logger.info(`[AutomationEngine] Running rule: ${rule.name}`);
          await rule.actions(payload);
        } catch (err) {
          logger.error(`[AutomationEngine] Rule execution failed for "${rule.name}":`, err);
        }
      }
    }
  }
}

export const automationEngine = new AutomationEngine();
