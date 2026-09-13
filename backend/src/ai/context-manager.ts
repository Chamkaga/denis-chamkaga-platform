// src/ai/context-manager.ts
// Context Manager enforcing context selection, token budgeting, and fact aggregating before prompt construction.

import { aiMemory, ChatSessionFacts } from './memory';
import { aiIntentClassifier, IntentScore } from './intent-classifier';
import { leadIntelligenceService, LeadGrading } from './services/lead-intelligence.service';
import { aiKnowledgeEngine, KnowledgeDocument } from './knowledge-engine';
import { AI_TOOLS_REGISTRY, ToolDefinition } from './tools/tool-registry';
import { adminCopilotService, AdminPlatformContext } from './services/admin-copilot.service';
import prisma from '../config/database';
import { logger } from '../utils/logger';

export interface UIState {
  denisAvailability: string;
  callButtonAvailable: boolean;
  callButtonLocation: string;
  chatAvailability: 'active';
  consultationBookingAvailable: boolean;
}

export interface LatencyBreakdown {
  intentClassificationMs: number;
  retrievalMs: number;
  promptConstructionMs?: number;
  ttftMs?: number;
  totalDurationMs?: number;
}

export interface AIContext {
  history: { role: 'user' | 'assistant' | 'system'; content: string }[];
  facts: ChatSessionFacts;
  lead: LeadGrading;
  intents: IntentScore[];
  knowledge: KnowledgeDocument[];
  allowedTools: ToolDefinition[];
  allowedCards: string[];
  businessRules: string[];
  currentLanguage: 'sw' | 'en';
  featureFlags: Record<string, boolean>;
  userRole?: 'visitor' | 'admin' | 'super_admin' | 'client';
  adminPlatformContext?: AdminPlatformContext; // Only present for admin role
  contextSummary?: string;
  conversationState: {
    currentBusinessType?: string;
    currentProblem?: string;
    currentTopic: string;
    currentIntent: string;
    previousAssistantQuestion?: string;
    pendingReference?: string;
    leadState: string;
  };
  presenceState?: string;
  uiState: UIState;
  latencyBreakdown?: LatencyBreakdown;
}

export const aiContextManager = {
  /**
   * Performs dynamic context selection, retrieves relevant memory/knowledge, and builds the aggregated context with parallelized operations.
   */
  async getContext(params: {
    message: string;
    sessionId: string;
    visitorId?: string;
    history: { role: 'user' | 'assistant' | 'system'; content: string }[];
    currentLanguage?: 'sw' | 'en';
    userRole?: 'visitor' | 'admin' | 'super_admin' | 'client';
    sessionMetadata?: Record<string, any>;
    presenceState?: string;
  }): Promise<AIContext> {
    const { message, sessionId, history, currentLanguage = 'en', userRole = 'visitor' } = params;

    // Retrieve contextSummary if present in session metadata (or preloaded metadata)
    let sessionMeta = params.sessionMetadata;
    if (!sessionMeta) {
      const sessionRecord = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        select: { metadata: true }
      });
      sessionMeta = (sessionRecord?.metadata as Record<string, any>) || {};
    }
    const contextSummary = sessionMeta.contextSummary || undefined;

    // 1. Gather Feature Flags from config/environment
    const featureFlags = {
      AI_VISITOR_INTELLIGENCE: process.env.AI_VISITOR_INTELLIGENCE !== 'false',
      AI_MEMORY_ENGINE: process.env.AI_MEMORY_ENGINE !== 'false',
      AI_KNOWLEDGE_ENGINE: process.env.AI_KNOWLEDGE_ENGINE !== 'false',
      AI_LEAD_INTELLIGENCE: process.env.AI_LEAD_INTELLIGENCE !== 'false',
      WEBRTC_ENABLED: process.env.WEBRTC_ENABLED === 'true',
    };

    // 2. Perform continuous intent classification (Fast tokenized word boundary classification)
    const tIntentStart = performance.now();
    const intents = aiIntentClassifier.classify(message);
    const intentClassificationMs = performance.now() - tIntentStart;
    const primaryIntent = intents[0]?.intent || 'General Inquiry';
    const previousAssistant = [...history].reverse().find(item => item.role === 'assistant')?.content;
    const previousAssistantQuestion = previousAssistant?.split(/(?<=[.!?])\s+/).reverse().find(sentence => sentence.includes('?'));
    const topicText = `${previousAssistant || ''} ${message}`.toLowerCase();
    const pendingReference = ['pos', 'invoice', 'quotation', 'payment', 'whatsapp', 'excel', 'stock', 'crm', 'erp']
      .find(entity => topicText.includes(entity));

    // 3. Parallelize independent lookups: Memory Facts, Knowledge Retrieval, and Site Settings / Presence
    const DEFAULT_KNOWLEDGE_RETRIEVAL_LIMIT = 3;
    const targetAudience = userRole === 'admin' || userRole === 'super_admin' ? 'ADMIN' : 'MARY';

    const tRetrievalStart = performance.now();
    const [factsResult, knowledgeResult, presenceRecord] = await Promise.all([
      featureFlags.AI_MEMORY_ENGINE ? aiMemory.getFacts(sessionId) : Promise.resolve({} as ChatSessionFacts),
      featureFlags.AI_KNOWLEDGE_ENGINE
        ? aiKnowledgeEngine.retrieve(
            message.trim().split(/\s+/).length <= 5
              ? `${message} ${history.slice(-4).map(item => item.content).join(' ')}`
              : message,
            DEFAULT_KNOWLEDGE_RETRIEVAL_LIMIT, {
            audience: targetAudience,
            userRole,
            language: currentLanguage
          })
        : Promise.resolve([] as KnowledgeDocument[]),
      params.presenceState
        ? Promise.resolve({ value: params.presenceState })
        : prisma.siteSetting.findUnique({ where: { key: 'presence_state' } })
    ]);
    const retrievalMs = performance.now() - tRetrievalStart;

    let facts: ChatSessionFacts = factsResult || {};
    const knowledge: KnowledgeDocument[] = knowledgeResult || [];
    const presenceState = presenceRecord?.value || 'Offline';

    // Auto-detect AI-first preference from current message or history if not yet set
    const combinedText = [...history.map(h => h.content), message].join(' ').toLowerCase();
    const aiFirstPhrases = [
      'help me first', 'help me first before', 'why don\'t you help me first',
      'why you not help me first', 'guide me instead', 'guide me instead of denis',
      'not online you can guide me', 'saidia kwanza', 'badala ya denis', 'haja ya denis',
      'no need to speak to denis', 'don\'t want to speak to denis yet'
    ];
    if (aiFirstPhrases.some(p => combinedText.includes(p))) {
      if (!facts.aiFirstPreference) {
        facts.aiFirstPreference = true;
        if (featureFlags.AI_MEMORY_ENGINE) {
          aiMemory.saveFacts(sessionId, facts).catch(e => logger.error('Failed to save AI first preference:', e));
        }
      }
    }

    // 4. Evaluate Lead grading
    const msgCount = history.filter(h => h.role === 'user').length + 1;
    const lead = leadIntelligenceService.evaluate(facts, primaryIntent, msgCount);

    // 6. Token Budgeting: Limit history to last 6 turns to fit within context limits
    const budgetedHistory = history.slice(-6);

    // 7. Enforce allowed tools based on user roles and active intent
    const allowedTools: ToolDefinition[] = [];
    for (const tool of Object.values(AI_TOOLS_REGISTRY)) {
      if (tool.allowedRoles.includes(userRole)) {
        allowedTools.push(tool);
      }
    }

    // 8. Decide context-allowed Conversation Cards
    const allowedCards: string[] = [];
    if (userRole !== 'admin') {
      if (facts.visitorProfile === 'Explorer' || facts.visitorProfile === 'Student / Learner') {
        allowedCards.push('edu-resource');
      } else {
        if (!facts.industry) allowedCards.push('select-industry');
        else if (!facts.company) allowedCards.push('business-name-input');
        else if (!facts.budget) allowedCards.push('budget-range');
        else allowedCards.push('confirm-consultation');
      }
    }

    // Build dynamic UI state grounding object
    const uiState: UIState = {
      denisAvailability: presenceState,
      callButtonAvailable: true,
      callButtonLocation: 'bottom-left of the chat widget, beside the paperclip attachment control',
      chatAvailability: 'active',
      consultationBookingAvailable: true
    };

    // 9. Load business rules config
    const businessRules = userRole === 'admin'
      ? [
          "You are speaking with the platform Super Admin (Denis Chamkaga). Always be direct, technical, and highly informative.",
          "Bypass visitor conversation card selectors completely.",
          "Provide system status details, platform business settings explanation, and operational instructions cleanly.",
          "You have access to all verified business knowledge to answer admin's operational questions.",
          "Keep responses structured, professional, and under 250 words."
        ]
      : [
          "Always remain professional, helpful, and objective.",
          "Never generate code outside of Denis Chamkaga's core tech stack (PostgreSQL, Node.js, React, TypeScript).",
          "Do not make up facts or project details. If not found in retrieved knowledge, state that Denis will clarify.",
          "If the user says 'end', 'stop', 'thank you', 'bye', 'asante', or indicates the conversation is finished, respond politely, do NOT ask any follow-up questions, and end the response naturally. Otherwise, engage the visitor by asking exactly 1 context-relevant question at the end of the message.",
          "Keep responses structured and concise (ideally under 150 words)."
        ];

    // 10. For admin users: fetch live platform operational context
    let adminPlatformContext: AdminPlatformContext | undefined;
    if (userRole === 'admin' || userRole === 'super_admin') {
      adminPlatformContext = await adminCopilotService.getPlatformContext();
    }

    return {
      history: budgetedHistory,
      facts,
      lead,
      intents,
      knowledge,
      allowedTools,
      allowedCards,
      businessRules,
      currentLanguage,
      featureFlags,
      userRole,
      adminPlatformContext,
      contextSummary,
      conversationState: {
        currentBusinessType: facts.industry,
        currentProblem: facts.challenges,
        currentTopic: pendingReference || primaryIntent,
        currentIntent: primaryIntent,
        previousAssistantQuestion,
        pendingReference,
        leadState: lead.temperature
      },
      presenceState,
      uiState,
      latencyBreakdown: {
        intentClassificationMs,
        retrievalMs
      }
    };
  }
};
