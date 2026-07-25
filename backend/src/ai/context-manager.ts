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
  presenceState?: string;
}

export const aiContextManager = {
  /**
   * Performs dynamic context selection, retrieves relevant memory/knowledge, and builds the aggregated context.
   */
  async getContext(params: {
    message: string;
    sessionId: string;
    visitorId?: string;
    history: { role: 'user' | 'assistant' | 'system'; content: string }[];
    currentLanguage?: 'sw' | 'en';
    userRole?: 'visitor' | 'admin' | 'super_admin' | 'client';
  }): Promise<AIContext> {
    const { message, sessionId, history, currentLanguage = 'en', userRole = 'visitor' } = params;

    // Retrieve contextSummary if present in session metadata
    const sessionRecord = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      select: { metadata: true }
    });
    const sessionMeta = (sessionRecord?.metadata as Record<string, any>) || {};
    const contextSummary = sessionMeta.contextSummary || undefined;

    // Fetch Live Admin Availability Presence State from DB
    const presenceRecord = await prisma.siteSetting.findUnique({
      where: { key: 'presence_state' }
    });
    const presenceState = presenceRecord?.value || 'Offline';

    // 1. Gather Feature Flags from config/environment
    const featureFlags = {
      AI_VISITOR_INTELLIGENCE: process.env.AI_VISITOR_INTELLIGENCE !== 'false',
      AI_MEMORY_ENGINE: process.env.AI_MEMORY_ENGINE !== 'false',
      AI_KNOWLEDGE_ENGINE: process.env.AI_KNOWLEDGE_ENGINE !== 'false',
      AI_LEAD_INTELLIGENCE: process.env.AI_LEAD_INTELLIGENCE !== 'false',
      WEBRTC_ENABLED: process.env.WEBRTC_ENABLED === 'true',
    };

    // 2. Load facts using memory hierarchy (Session, Visitor, Organization)
    let facts: ChatSessionFacts = {};
    if (featureFlags.AI_MEMORY_ENGINE) {
      facts = await aiMemory.getFacts(sessionId);
    }

    // 3. Perform continuous intent classification
    const intents = aiIntentClassifier.classify(message);
    const primaryIntent = intents[0]?.intent || 'General Inquiry';

    // 4. Retrieve context-specific Knowledge documents (RAG)
    let knowledge: KnowledgeDocument[] = [];
    if (featureFlags.AI_KNOWLEDGE_ENGINE) {
      knowledge = await aiKnowledgeEngine.retrieve(message, 3);
    }

    // 5. Evaluate Lead grading
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
      presenceState
    };
  }
};
