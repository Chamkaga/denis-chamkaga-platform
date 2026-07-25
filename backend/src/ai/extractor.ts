// src/ai/extractor.ts
// Asynchronous background extraction service identifying visitor profiles, stage, goals, and facts.

import { getAIProvider } from './providers';
import { aiMemory, ChatSessionFacts } from './memory';
import { logger } from '../utils/logger';
import prisma from '../config/database';

export const aiExtractor = {
  /**
   * Run background task using a fast LLM request to update intent/facts from the latest turn.
   */
  async extractContext(params: {
    sessionId: string;
    userMessage: string;
    assistantResponse: string;
  }): Promise<void> {
    const { sessionId, userMessage, assistantResponse } = params;

    try {
      const existingFacts = await aiMemory.getFacts(sessionId);
      
      // Feature Flag Check: If memory engine is disabled, do not update
      if (process.env.AI_MEMORY_ENGINE === 'false') {
        return;
      }

      logger.info(`[AI Extractor] Triggering async background facts extraction for session: ${sessionId}`);

      const systemPrompt = `You are a background data extraction utility.
Your job is to read the latest User Message, the latest Assistant Response, and the Existing Memory JSON, and output an updated JSON block containing all parsed values.

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

      const turnPrompt = `User Message: "${userMessage}"\nAssistant Response: "${assistantResponse}"`;

      let parsedFacts: Partial<ChatSessionFacts> = {};
      try {
        const provider = getAIProvider();
        const messages = [
          { role: 'system' as const, content: systemPrompt },
          { role: 'user' as const, content: turnPrompt }
        ];
        const startTime = Date.now();
        const result = await provider.generate(messages);
        const cleanContent = result.content.replace(/```json/g, '').replace(/```/g, '').trim();
        logger.info(`[AI Extractor] LLM raw extraction result in ${Date.now() - startTime}ms: ${cleanContent}`);
        parsedFacts = JSON.parse(cleanContent);
      } catch (e: any) {
        logger.warn('[AI Extractor] Provider call or JSON parse failed, falling back to rule heuristics:', e.message);
        parsedFacts = aiMemory.learnFactsIncremental(userMessage, assistantResponse, existingFacts);
      }

      // Merge new facts into existing facts
      const mergedFacts: ChatSessionFacts = {
        ...existingFacts,
        ...parsedFacts,
        // Ensure email/phone/name extracted by rule-based heuristic takes priority if LLM missed it
        ...aiMemory.learnFactsIncremental(userMessage, assistantResponse, {})
      };

      // Save to memory database
      await aiMemory.saveFacts(sessionId, mergedFacts);

      // Trigger rolling conversation summarizer asynchronously
      aiMemory.summarizeSessionHistory(sessionId).catch(err => {
        logger.error('[AI Extractor] Failed to run rolling context summary:', err);
      });

      // Link email/phone/company details to Lead if session is already qualified
      const session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        select: { leadId: true }
      });

      if (session?.leadId && (mergedFacts.email || mergedFacts.phone)) {
        await prisma.lead.update({
          where: { id: session.leadId },
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
    }
  }
};
