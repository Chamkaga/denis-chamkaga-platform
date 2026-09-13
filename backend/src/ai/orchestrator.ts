// src/ai/orchestrator.ts

import { aiGuards } from './guards';
import { aiMemory } from './memory';
import { aiContextManager } from './context-manager';
import { aiPromptBuilder } from './prompt-builder';
import { getAIProvider } from './providers';
import { aiResponseValidator } from './response-validator';
import { aiCommunicationEngine } from './communication-engine';
import { aiEventBus } from './event-bus';
import { memoryJobService } from './memory-job.service';
import prisma from '../config/database';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { env } from '../config/env';
import { aiGenerationCounter, aiStageDurationHistogram } from '../telemetry/metrics';
import { pricingCapability } from './capabilities/pricing.capability';

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
  visitorId: string;
  provider: string;
  model: string;
  generationMode: 'live' | 'fallback' | 'offline';
  providerErrorCode?: string;
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

function synthesizeKnowledgeFallback(query: string, intent: string, lang: 'sw' | 'en'): string {
  const isSwahili = lang === 'sw';
  const lower = query.toLowerCase();

  if (intent === 'Greeting') {
    return isSwahili
      ? "Habari! 👋 Jina langu ni Mary, Msaidizi wa Biashara wa Denis Chamkaga. Karibu! Ninawezaje kukusaidia leo?"
      : "Hello! 👋 My name is Mary, Denis Chamkaga's Business Assistant. How can I help you today?";
  }

  if (intent === 'Unsupported Question' || lower.includes('rocket') || lower.includes('space travel') || lower.includes('spaceship')) {
    return isSwahili
      ? "Mimi ni Msaidizi wa Biashara wa Denis Chamkaga anayehusika na mifumo ya biashara (POS, ERP, CRM, Web & Mobile Apps). Hatujengi roketi au miundombinu ya anga. Je, ninawezaje kukusaidia kuhusu mfumo wa biashara yako?"
      : "I am Denis Chamkaga's Business Assistant focusing strictly on business software systems (POS, ERP, CRM, Web & Mobile Apps). We do not build rockets or aerospace hardware. How can I assist you with your business software needs?";
  }

  return isSwahili
    ? "Samahani, kwa sasa kuna hitilafu ya muda katika kuunganisha na hifadhi ya taarifa za biashara. Tafadhali jaribu kuuliza tena au wasiliana moja kwa moja na Denis."
    : "I am temporarily experiencing a connectivity delay with our business knowledge service. Please try asking again in a moment or book a direct consultation with Denis Chamkaga.";
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
        temperature: 'cold',
        visitorId: session.visitorId || input.visitorId || 'anonymous_visitor',
        provider: 'none',
        model: 'none',
        generationMode: 'offline'
      };
    }

    // 3. Context Aggregation via Context Manager
    const historyDb = await prisma.aiConversation.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const contextHistory = historyDb.reverse().map(h => ({
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

    const contextStartedAt = performance.now();
    const context = await aiContextManager.getContext({
      message: sanitizedText,
      sessionId,
      visitorId: session.visitorId || undefined,
      history: [...contextHistory, { role: 'user', content: sanitizedText }],
      currentLanguage,
      userRole: role,
      sessionMetadata: sessionMeta
    });
    aiStageDurationHistogram.observe({ stage: 'context_intent_retrieval' }, (performance.now() - contextStartedAt) / 1000);

    const primaryIntent = context.intents[0]?.intent || 'General Inquiry';
    const primaryConfidence = context.intents[0]?.confidence || 0.4;

    // 4. Prompt construction & timing
    const tPromptStart = performance.now();
    const providerMessages = aiPromptBuilder.build(context);
    const promptConstructionMs = performance.now() - tPromptStart;
    aiStageDurationHistogram.observe({ stage: 'prompt_construction' }, promptConstructionMs / 1000);

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
    let ttftMs = 0;
    let firstTokenLogged = false;
    let providerName = 'openai';
    let modelName = env.OPENAI_MODEL;
    let generationMode: 'live' | 'fallback' | 'offline' = 'fallback';
    let providerErrorCode: string | undefined;

    // Wrap token callback to track high-resolution Time To First Token (TTFT)
    const wrappedOnToken = onToken ? (token: string) => {
      if (!firstTokenLogged && token.length > 0) {
        firstTokenLogged = true;
        ttftMs = Date.now() - startTime;
      }
      onToken(token);
    } : undefined;

    // 6. Execute generation
    try {
      if (hasStream && wrappedOnToken) {
        const res = await provider.stream(providerMessages, wrappedOnToken);
        responseText = res.content;
        tokensUsed = res.tokensUsed || 0;
        durationMs = res.durationMs || 0;
        providerName = res.provider;
        modelName = res.model;
        generationMode = res.mode;
        providerErrorCode = res.errorCode;
      } else {
        const res = await provider.generate(providerMessages);
        responseText = res.content;
        tokensUsed = res.tokensUsed || 0;
        durationMs = res.durationMs || 0;
        ttftMs = durationMs;
        providerName = res.provider;
        modelName = res.model;
        generationMode = res.mode;
        providerErrorCode = res.errorCode;
      }
    } catch (err) {
      logger.error('[AI Orchestrator] Provider execution failed, rendering natural business response fallback:', err);
      
      const isDeferringHandoff = primaryIntent === 'Handoff Deferral' || ['help me first', 'guide me instead', 'before denis', 'instead of denis', 'not denis', 'without denis'].some(term => sanitizedText.toLowerCase().includes(term));
      const explicitDenisRequest = ['ongea na denis', 'speak to denis', 'call denis', 'connect to denis', 'human agent', 'talk to denis', 'want denis', 'i want denis', 'speak with denis'].some(term => sanitizedText.toLowerCase().includes(term));
      const isAskingForDenis = !isDeferringHandoff && (explicitDenisRequest || (!context.facts.aiFirstPreference && sanitizedText.toLowerCase().includes('denis')));
      const activePresence = (context.presenceState || 'Offline').trim().toLowerCase();

      if (isAskingForDenis) {
        if (activePresence === 'online') {
          responseText = currentLanguage === 'sw'
            ? "Denis yupo online kwa sasa. Unaweza kuanzisha simu ya sauti (voice call) moja kwa moja kupitia kitufe cha kupiga kilichopo chini kushoto (bottom-left) mwa chat widget hii, pembeni ya kitufe cha kuunganisha faili."
            : "Denis is currently online and available. You can place a direct voice call using the call button located at the bottom-left of this chat widget, right beside the paperclip attachment control.";
        } else if (activePresence === 'busy') {
          responseText = currentLanguage === 'sw'
            ? "Denis yuko busy kwa sasa akifanyia kazi mifumo ya wateja wetu. Mimi Mary nipo hapa kukusaidia kuelewa huduma zetu, kuandaa mahitaji au kupata nukuu ya bei."
            : "Denis is currently busy working on client projects. I am fully briefed to assist you with system planning, requirement discovery, or quotes.";
        } else if (activePresence === 'meeting') {
          responseText = currentLanguage === 'sw'
            ? "Denis yuko kwenye mkutano kwa sasa. Mimi Mary naweza kukusaidia kufafanua mfumo unaohitaji au kuweka miadi kupitia kitufe cha 'Panga Mkutano'."
            : "Denis is currently in a strategy meeting. I can help define your system requirements or assist you in scheduling a meeting.";
        } else {
          responseText = currentLanguage === 'sw'
            ? "Denis hayupo mkondoni kwa sasa. Mimi Mary naweza kukusaidia kupanga mfumo wako, kutoa maelezo ya huduma zetu au kuchukua taarifa zako."
            : "Denis is currently offline. I am available to guide you through our system capabilities, help define your requirements, or prepare a project overview.";
        }
      } else {
        responseText = synthesizeKnowledgeFallback(
          sanitizedText,
          primaryIntent,
          currentLanguage
        );
      }

      if (hasStream && wrappedOnToken) {
        wrappedOnToken(responseText);
      }
      generationMode = 'fallback';
      providerErrorCode = 'PROVIDER_UNAVAILABLE';
    }

    // 7. Apply deterministic business capabilities when generation is degraded.
    if (generationMode !== 'live' && primaryIntent === 'Pricing Inquiry') {
      responseText = pricingCapability.explainApprovedRange({
        facts: context.facts,
        conversationText: [...contextHistory.map(item => item.content), sanitizedText].join(' '),
        language: currentLanguage
      }) || responseText;
    }

    // 8. Response validation
    aiGenerationCounter.inc({ provider: providerName, model: modelName, mode: generationMode, error_code: providerErrorCode || 'none' });
    aiStageDurationHistogram.observe({ stage: 'provider' }, durationMs / 1000);
    const validation = aiResponseValidator.validateResponse(responseText, currentLanguage === 'sw');
    if (validation.replacement) {
      responseText = validation.replacement;
    }

    const grantsVoiceCall = primaryIntent === 'Human Handoff Request'
      && (context.presenceState || '').trim().toLowerCase() === 'online';
    const existingSessionMetadata = (session.metadata as Record<string, any> | null) || {};
    const nextSessionMetadata = grantsVoiceCall
      ? {
          ...existingSessionMetadata,
          maryCallAuthorization: {
            allowed: true,
            grantedBy: 'mary',
            grantedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
            consumedAt: null
          }
        }
      : existingSessionMetadata;

    // 8. Asynchronous logs saving
    const [, , updatedSession] = await prisma.$transaction([
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
            provider: providerName,
            model: modelName,
            generationMode,
            providerErrorCode,
            ttftMs: generationMode === 'live' ? ttftMs : null,
            fallbackFirstTokenMs: generationMode === 'live' ? null : ttftMs
          }
        }
      }),
      prisma.chatSession.update({
        where: { id: sessionId },
        data: {
          messageCount: { increment: 2 },
          leadScore: context.lead.score,
          metadata: nextSessionMetadata
        }
      })
    ]);

    // 9. Persist a durable, versioned memory extraction job.
    await memoryJobService.enqueue({
      sessionId,
      conversationVersion: updatedSession.messageCount,
      userMessage: sanitizedText,
      assistantResponse: responseText
    });

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
    const intentMs = context.latencyBreakdown?.intentClassificationMs || 0;
    const retMs = context.latencyBreakdown?.retrievalMs || 0;

    const firstTokenLabel = generationMode === 'live' ? `LLM TTFT: ${ttftMs}ms` : `Fallback first token: ${ttftMs}ms`;
    logger.info(`[AI Latency Metrics] Query: "${sanitizedText.substring(0, 40)}" | ${firstTokenLabel} | Total: ${duration}ms | Intent: ${intentMs.toFixed(1)}ms | Retrieval: ${retMs.toFixed(1)}ms (${knowledgeDocs.length} docs) | Prompt: ${promptConstructionMs.toFixed(1)}ms | ResponseLength: ${responseText.length} chars`);
    logger.info(`[AI Orchestrator] Message processed in ${duration}ms. Intent: ${primaryIntent} | Lead Score: ${context.lead.score}%`);

    return {
      response: responseText,
      sessionId,
      intent: primaryIntent,
      leadScore: context.lead.score,
      temperature: context.lead.temperature,
      recommendation: channelRecommendation,
      visitorId: session.visitorId || input.visitorId || 'anonymous_visitor',
      provider: providerName,
      model: modelName,
      generationMode,
      providerErrorCode
    };
  }
};
