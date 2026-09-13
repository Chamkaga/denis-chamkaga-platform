// src/ai/extractor.ts
// Asynchronous background extraction service identifying visitor profiles, stage, goals, and facts.

import { getAIProvider } from './providers';
import { aiMemory, ChatSessionFacts } from './memory';
import { logger } from '../utils/logger';
import prisma from '../config/database';
import { z } from 'zod';

const extractedFactsSchema = z.object({
  visitorProfile: z.enum(['Explorer', 'Student / Learner', 'Startup Founder', 'Small Business Owner', 'Registered Company', 'Existing Client']).optional(),
  businessStage: z.enum(['Idea', 'Startup', 'Established', 'Growth', 'Not Applicable']).optional(),
  goals: z.string().trim().min(1).max(500).optional(),
  challenges: z.string().trim().min(1).max(500).optional(),
  name: z.string().trim().min(1).max(120).optional(),
  company: z.string().trim().min(1).max(160).optional(),
  email: z.string().email().max(254).optional(),
  phone: z.string().regex(/^\+?[0-9][0-9\s-]{8,18}$/).optional(),
  budget: z.string().trim().min(1).max(120).optional(),
  industry: z.string().trim().min(1).max(120).optional(),
}).strict();

export const aiExtractor = {
  /**
   * Run background task using a fast LLM request to update intent/facts from the latest turn.
   */
  async extractContext(params: {
    sessionId: string;
    userMessage: string;
    assistantResponse: string;
    conversationVersion: number;
  }): Promise<void> {
    const { sessionId, userMessage, conversationVersion } = params;

    try {
      // Feature Flag Check: If memory engine is disabled, do not update
      if (process.env.AI_MEMORY_ENGINE === 'false') {
        return;
      }

      const currentSession = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        select: { metadata: true, messageCount: true, leadId: true }
      });
      if (!currentSession || currentSession.messageCount !== conversationVersion) {
        throw new Error('MEMORY_JOB_STALE_OR_SESSION_DELETED');
      }
      const currentMeta = (currentSession.metadata as Record<string, any>) || {};
      const existingFacts = (currentMeta.facts as ChatSessionFacts) || {};

      logger.info(`[AI Extractor] Triggering async background facts extraction for session: ${sessionId}`);

      const systemPrompt = `You are a background data extraction utility.
Your job is to extract facts explicitly stated by the user in the latest User Message. Never copy or infer facts from an assistant response. Output only newly supported fields.

Supported visitorProfile values: Explorer, Student / Learner, Startup Founder, Small Business Owner, Registered Company, Existing Client.
Supported businessStage values: Idea, Startup, Established, Growth, Not Applicable.

Output ONLY a valid JSON object matching this TypeScript interface (do not explain, do not add markdown backticks):
{
  "visitorProfile"?: string;
  "businessStage"?: string;
  "goals"?: string;
  "challenges"?: string;
  "name"?: string;
  "company"?: string;
  "email"?: string;
  "phone"?: string;
  "budget"?: string;
  "industry"?: string;
}

Existing Memory JSON:
${JSON.stringify(existingFacts)}`;

      const turnPrompt = `User Message: "${userMessage}"`;

      let parsedFacts: Partial<ChatSessionFacts> = {};
      try {
        const provider = getAIProvider();
        const messages = [
          { role: 'system' as const, content: systemPrompt },
          { role: 'user' as const, content: turnPrompt }
        ];
        const startTime = Date.now();
        const result = await provider.generate(messages, { allowFallback: false });
        const cleanContent = result.content.replace(/```json/g, '').replace(/```/g, '').trim();
        logger.info(`[AI Extractor] LLM raw extraction result in ${Date.now() - startTime}ms: ${cleanContent}`);
        parsedFacts = extractedFactsSchema.parse(JSON.parse(cleanContent));
      } catch (e: any) {
        logger.warn('[AI Extractor] Provider extraction unavailable or invalid; applying user-message-only rules:', e.message);
        parsedFacts = aiMemory.learnFactsIncremental(userMessage, '', existingFacts);
      }

      // Merge new facts into existing facts
      const mergedFacts: ChatSessionFacts = {
        ...existingFacts,
        ...parsedFacts,
        // Ensure email/phone/name extracted by rule-based heuristic takes priority if LLM missed it
        ...aiMemory.learnFactsIncremental(userMessage, '', {})
      };

      const saved = await prisma.chatSession.updateMany({
        where: { id: sessionId, messageCount: conversationVersion },
        data: { metadata: { ...currentMeta, facts: mergedFacts } as any }
      });
      if (saved.count !== 1) throw new Error('MEMORY_JOB_STALE_OR_SESSION_DELETED');

      // Trigger rolling conversation summarizer asynchronously
      aiMemory.summarizeSessionHistory(sessionId, conversationVersion).catch(err => {
        logger.error('[AI Extractor] Failed to run rolling context summary:', err);
      });

      // Link email/phone/company details to Lead if session is already qualified
      if (currentSession.leadId && (mergedFacts.email || mergedFacts.phone)) {
        await prisma.lead.updateMany({
          where: { id: currentSession.leadId },
          data: {
            email: mergedFacts.email || null,
            phone: mergedFacts.phone || null,
            company: mergedFacts.company || null,
            name: mergedFacts.name || 'Anonymous client'
          }
        });
      }

    } catch (err) {
      logger.error('[AI Extractor] Asynchronous context extraction failed:', err);
      throw err;
    }
  }
};
