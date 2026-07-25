// src/ai/orchestrator.ts

import { aiGuards } from './guards';
import { aiMemory } from './memory';
import { aiContextManager } from './context-manager';
import { aiPromptBuilder } from './prompt-builder';
import { getAIProvider } from './providers';
import { aiResponseValidator } from './response-validator';
import { aiCommunicationEngine } from './communication-engine';
import { aiEventBus } from './event-bus';
import { aiExtractor } from './extractor';
import prisma from '../config/database';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

export interface OrchestratorInput {
  message: string;
  sessionId?: string;
  visitorId?: string;
  userRole?: 'visitor' | 'admin' | 'super_admin' | 'client';
  language?: 'en' | 'sw';
}

export interface OrchestratorOutput {
  response: string;
  sessionId: string;
  intent: string;
  leadScore: number;
  temperature: string;
  recommendation?: any;
}

function isSwahili(text: string): boolean {
  const swKeywords = [
    'habari', 'jambo', 'mambo', 'kiswahili', 'naomba', 'ndio', 'hapana', 'shwari', 
    'salama', 'gani', 'huduma', 'mifumo', 'biashara', 'kazi', 'vipi', 'samahani', 
    'tafadhali', 'asante', 'karibu', 'sana', 'kaka', 'dada', 'nilikuwa', 'ninahitaji', 
    'nataka', 'kuhusu', 'nisaidie', 'bei', 'gharama', 'ratiba', 'miadi', 'mkutano', 
    'wasiliana', 'simu', 'kwa', 'wateja', 'ujumbe', 'tovuti', 'ofisi', 'kidijitali',
    'kwanza', 'mbili', 'tatu', 'nne', 'tano', 'vp', 'nini', 'kwani', 'nani', 'lini',
    'wapi', 'jinsi', 'nzuri', 'upande', 'pesa', 'shilingi', 'malipo', 'mkataba',
    'ingia', 'tuma', 'ghairi'
  ];
  const lower = text.toLowerCase();
  return swKeywords.some(kw => new RegExp(`\\b${kw}\\b`).test(lower));
}

function isEnglish(text: string): boolean {
  const enKeywords = [
    'hello', 'hi', 'hey', 'what', 'how', 'why', 'who', 'where', 'please', 'thank', 
    'thanks', 'you', 'service', 'services', 'project', 'projects', 'about', 'contact', 
    'booking', 'pricing', 'business', 'system', 'systems', 'consultation', 'meeting',
    'experience', 'technologies', 'portfolio', 'process', 'agribusiness', 'recycle',
    'custom', 'developer', 'development', 'schedule', 'price', 'costs', 'cost', 'pay', 
    'invoice', 'quotation', 'cancel', 'submit', 'send'
  ];
  const lower = text.toLowerCase();
  return enKeywords.some(kw => new RegExp(`\\b${kw}\\b`).test(lower));
}

export const aiOrchestrator = {
  /**
   * Main entry point for all AI modules. Coordinates pipeline flow.
   */
  async processMessage(
    input: OrchestratorInput,
    onToken?: (token: string) => void
  ): Promise<OrchestratorOutput> {
    const startTime = Date.now();
    const sanitizedText = aiGuards.sanitizeInput(input.message);
    const role = input.userRole || 'visitor';
    const hasStream = !!onToken;

    // 1. Load or initialize visitor session
    let session = input.sessionId
      ? await prisma.chatSession.findUnique({ where: { id: input.sessionId } })
      : null;

    const initialTitle = sanitizedText.substring(0, 30) + (sanitizedText.length > 30 ? '...' : '');

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          visitorId: input.visitorId || 'anonymous_visitor',
          status: 'active',
          metadata: { userAgent: 'web', title: initialTitle, facts: {} },
        },
      });
      aiEventBus.publish('ConversationStarted', { sessionId: session.id, visitorId: session.visitorId || undefined });
    }

    const sessionId = session.id;

    // 2. Input security filtering (only for non-admin roles)
    const injectionMatched = role !== 'admin' && aiGuards.detectInjection(sanitizedText);
    const offTopicMatched = role !== 'admin' && aiGuards.isOffTopic(sanitizedText);

    if (injectionMatched || offTopicMatched) {
      const sessionMeta = (session.metadata as Record<string, any>) || {};
      const previousLanguage = sessionMeta.language;
      const sw = isSwahili(sanitizedText) ? true : (previousLanguage === 'sw' ? true : false);
      const safetyReply = sw
        ? "Mimi ni Msaidizi wa Denis. Jukumu langu ni kuwasaidia wageni kuhusu huduma za Denis Chamkaga, mifumo ya kidijitali na biashara. Kwa maswali yasiyohusiana na hayo, tafadhali tumia mifumo mingine ya AI."
        : "I am Denis Assistant. My role is to assist visitors with Denis Chamkaga's services, digital systems and business solutions. For other queries, please use a general-purpose AI assistant.";

      if (hasStream && onToken) {
        onToken(safetyReply);
      }

      // Asynchronously log security blocked conversation message to history
      prisma.aiConversation.create({
        data: {
          sessionId,
          role: 'user',
          content: sanitizedText,
          intent: 'blocked_safety',
        }
      }).then(() => prisma.aiConversation.create({
        data: {
          sessionId,
          role: 'assistant',
          content: safetyReply,
          intent: 'blocked_safety',
        }
      })).catch(err => logger.error('Failed to log blocked activity:', err));

      return {
        response: safetyReply,
        sessionId,
        intent: 'blocked_safety',
        leadScore: session.leadScore,
        temperature: 'cold'
      };
    }

    // 3. Context Aggregation via Context Manager
    const historyDb = await prisma.aiConversation.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: 10
    });

    const contextHistory = historyDb.map(h => ({
      role: h.role as 'user' | 'assistant' | 'system',
      content: h.content
    }));

    const sessionMeta = (session.metadata as Record<string, any>) || {};
    const previousLanguage = sessionMeta.language;

    let currentLanguage: 'sw' | 'en' = 'en';
    if (input.language === 'en' || input.language === 'sw') {
      currentLanguage = input.language;
    } else {
      const msgIsSwahili = isSwahili(sanitizedText);
      const msgIsEnglish = isEnglish(sanitizedText);

      if (msgIsSwahili) {
        currentLanguage = 'sw';
      } else if (msgIsEnglish) {
        currentLanguage = 'en';
      } else {
        currentLanguage = previousLanguage || 'en';
      }
    }

    if (previousLanguage !== currentLanguage) {
      sessionMeta.language = currentLanguage;
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { metadata: sessionMeta }
      });
    }

    const context = await aiContextManager.getContext({
      message: sanitizedText,
      sessionId,
      visitorId: session.visitorId || undefined,
      history: [...contextHistory, { role: 'user', content: sanitizedText }],
      currentLanguage,
      userRole: role
    });

    // 4. Prompt construction
    const providerMessages = aiPromptBuilder.build(context);

    // Knowledge Engine Inspection & Audit Logging
    const knowledgeDocs = context.knowledge || [];
    const docTitles = knowledgeDocs.map(d => d.title).join(', ');
    const totalPromptChars = providerMessages.reduce((sum, m) => sum + m.content.length, 0);

    logger.info(`[Knowledge Engine Audit] User Query: "${sanitizedText.substring(0, 60)}..."`);
    logger.info(`[Knowledge Engine Audit] Retrieved Documents Count: ${knowledgeDocs.length} [Titles: ${docTitles || 'None'}]`);
    logger.info(`[Knowledge Engine Audit] Context Length: ${JSON.stringify(context.knowledge).length} chars | Prompt Size: ${providerMessages.length} messages (${totalPromptChars} chars)`);

    // 5. Choose AI Provider (OpenAI Only in Production)
    const provider = getAIProvider();
    let responseText = '';
    let tokensUsed = 0;
    let durationMs = 0;

    // 6. Execute generation
    try {
      if (hasStream && onToken) {
        const res = await provider.stream(providerMessages, onToken);
        responseText = res.content;
        tokensUsed = res.tokensUsed || 0;
        durationMs = res.durationMs || 0;
      } else {
        const res = await provider.generate(providerMessages);
        responseText = res.content;
        tokensUsed = res.tokensUsed || 0;
        durationMs = res.durationMs || 0;
      }
    } catch (err) {
      logger.error('[AI Orchestrator] Provider execution failed, rendering Knowledge Engine fallback:', err);
      const knowledgeDocs = context.knowledge || (context as any).knowledgeItems || [];
      if (knowledgeDocs.length > 0) {
        const docsText = knowledgeDocs.slice(0, 2).map((d: any) => `**${d.title}**\n${d.content}`).join('\n\n');
        responseText = currentLanguage === 'sw'
          ? `Hapa kuna taarifa kutoka Hifadhi ya Maarifa ya Denis Chamkaga:\n\n${docsText}\n\nJe, una swali la ziada au ungependa kupanga ushauri wa biashara na Denis Chamkaga?`
          : `Here is relevant information from the Denis Chamkaga Knowledge Base:\n\n${docsText}\n\nWould you like more details or to schedule a business consultation with Denis Chamkaga?`;
      } else {
        responseText = currentLanguage === 'sw'
          ? "Karibu! 👋 Jina langu ni **Mary**, Msaidizi wa Biashara wa Denis Chamkaga. Nipo hapa kukusaidia kufahamu huduma zetu, kujibu maswali yako, au kukuunganisha moja kwa moja na Denis. Je, nawezaje kukusaidia leo?"
          : "Welcome! 👋 My name is **Mary**, Denis' Business Assistant. I am here to help you learn about our services, answer your questions, provide quotations, or connect you directly with Denis. How can I help you today?";
      }
      if (hasStream && onToken) {
        onToken(responseText);
      }
    }

    // 7. Response validation
    const validation = aiResponseValidator.validateResponse(responseText, currentLanguage === 'sw');
    if (!validation.isValid && validation.replacement) {
      responseText = validation.replacement;
    }

    const primaryIntent = context.intents[0]?.intent || 'General Inquiry';
    const primaryConfidence = context.intents[0]?.confidence || 0.4;

    // 8. Asynchronous logs saving
    await prisma.$transaction([
      prisma.aiConversation.create({
        data: {
          sessionId,
          role: 'user',
          content: sanitizedText,
          intent: primaryIntent,
          confidence: primaryConfidence
        }
      }),
      prisma.aiConversation.create({
        data: {
          sessionId,
          role: 'assistant',
          content: responseText,
          intent: primaryIntent,
          metadata: {
            tokensUsed,
            durationMs,
            provider: 'openai'
          }
        }
      }),
      prisma.chatSession.update({
        where: { id: sessionId },
        data: {
          messageCount: { increment: 2 },
          leadScore: context.lead.score
        }
      })
    ]);

    // 9. Trigger background facts extraction asynchronously
    aiExtractor.extractContext({
      sessionId,
      userMessage: sanitizedText,
      assistantResponse: responseText
    }).catch(err => logger.error('[AI Orchestrator] Background context extractor failed:', err));

    // Retrieve presence state & contact settings dynamically from DB
    const settingsList = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: ['presence_state', 'contact_phone', 'social_whatsapp', 'contact_email', 'booking_url']
        }
      }
    });
    const settingsMap = Object.fromEntries(settingsList.map(s => [s.key, s.value]));
    
    const presenceState = settingsMap['presence_state'] || 'Offline';
    const contactSettings = {
      phone: settingsMap['contact_phone'],
      whatsapp: settingsMap['social_whatsapp'],
      email: settingsMap['contact_email'],
      bookingUrl: settingsMap['booking_url']
    };

    // 10. Comm channel routing suggestion
    const channelRecommendation = aiCommunicationEngine.determineBestChannel(
      context.facts,
      primaryIntent,
      context.lead.score,
      presenceState,
      contactSettings
    );

    // 11. Event Bus updates
    const totalMsgCount = await prisma.aiConversation.count({ where: { sessionId } });
    aiEventBus.publish('ConversationUpdated', {
      sessionId,
      messageCount: totalMsgCount,
      leadScore: context.lead.score
    });

    if (context.lead.temperature === 'hot') {
      aiEventBus.publish('LeadQualified', {
        leadId: session.leadId || 'anonymous_lead',
        name: context.facts.name || 'Anonymous client',
        score: context.lead.score,
        temperature: context.lead.temperature
      });
    }

    const duration = Date.now() - startTime;
    logger.info(`[AI Orchestrator] Message processed in ${duration}ms. Intent: ${primaryIntent} | Lead Score: ${context.lead.score}%`);

    return {
      response: responseText,
      sessionId,
      intent: primaryIntent,
      leadScore: context.lead.score,
      temperature: context.lead.temperature,
      recommendation: channelRecommendation
    };
  }
};
