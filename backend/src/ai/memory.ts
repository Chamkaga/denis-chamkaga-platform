// src/ai/memory.ts
// Memory Engine managing hierarchical scopes (Session, Visitor, Organization) and incremental memory updates.

import { logger } from '../utils/logger';
import prisma from '../config/database';

export interface MemoryIdentityDomain {
  name?: string;
  company?: string;
  role?: string;
  email?: string;
  phone?: string;
}

export interface MemoryBusinessDomain {
  budget?: string;
  timeline?: string;
  goals?: string;
  challenges?: string;
  industry?: string;
}

export interface MemoryRelationshipDomain {
  trustLevel?: 'high' | 'medium' | 'low';
  objections?: string[];
  preferredChannel?: string;
  interests?: string;
}

export interface MemoryDecisionDomain {
  commitments?: string[];
  nextAction?: string;
  decisions?: string[];
}

export interface ChatSessionFacts {
  name?: string;
  company?: string;
  industry?: string;
  budget?: string;
  timeline?: string;
  branches?: number;
  phone?: string;
  email?: string;
  visitorProfile?: 'Explorer' | 'Student / Learner' | 'Startup Founder' | 'Small Business Owner' | 'Registered Company' | 'Existing Client';
  businessStage?: string;
  goals?: string;
  challenges?: string;
  interests?: string;
  previousAnswers?: Record<string, string>;

  // Progressive Enterprise Memory Domains
  identity?: MemoryIdentityDomain;
  business?: MemoryBusinessDomain;
  relationship?: MemoryRelationshipDomain;
  decisions?: MemoryDecisionDomain;
}

export const aiMemory = {
  /**
   * Loads and aggregates facts across hierarchical scopes: Session -> Visitor -> Organization.
   */
  async getFacts(sessionId: string): Promise<ChatSessionFacts> {
    try {
      // 1. Session Scope
      const session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        select: { metadata: true, visitorId: true, leadId: true }
      });
      if (!session) return {};

      const sessionMeta = (session.metadata as Record<string, any>) || {};
      const sessionFacts: ChatSessionFacts = sessionMeta.facts || {};

      // If AI_MEMORY_ENGINE feature flag is disabled, return local session facts only
      if (process.env.AI_MEMORY_ENGINE === 'false') {
        return sessionFacts;
      }

      // 2. Visitor Scope: Aggregate facts across other sessions belonging to this visitor
      let visitorFacts: ChatSessionFacts = {};
      if (session.visitorId) {
        const otherSessions = await prisma.chatSession.findMany({
          where: { visitorId: session.visitorId, id: { not: sessionId } },
          select: { metadata: true }
        });
        for (const s of otherSessions) {
          const meta = (s.metadata as Record<string, any>) || {};
          if (meta.facts) {
            visitorFacts = { ...visitorFacts, ...meta.facts };
          }
        }
      }

      // 3. Organization Scope: Load company parameters if lead link exists
      let orgFacts: ChatSessionFacts = {};
      if (session.leadId) {
        const lead = await prisma.lead.findUnique({
          where: { id: session.leadId },
          select: { company: true, email: true, phone: true }
        });
        if (lead) {
          orgFacts.company = lead.company || undefined;
          orgFacts.email = lead.email || undefined;
          orgFacts.phone = lead.phone || undefined;
        }
      }

      // Merge scopes: Organization takes priority, then Visitor, then Session
      const merged: ChatSessionFacts = {
        ...visitorFacts,
        ...sessionFacts,
        ...orgFacts
      };

      // Populate progressive domains dynamically for system use
      merged.identity = {
        name: merged.identity?.name || merged.name,
        company: merged.identity?.company || merged.company,
        email: merged.identity?.email || merged.email,
        phone: merged.identity?.phone || merged.phone
      };

      merged.business = {
        budget: merged.business?.budget || merged.budget,
        timeline: merged.business?.timeline || merged.timeline,
        goals: merged.business?.goals || merged.goals,
        challenges: merged.business?.challenges || merged.challenges,
        industry: merged.business?.industry || merged.industry
      };

      merged.relationship = {
        trustLevel: merged.relationship?.trustLevel,
        objections: merged.relationship?.objections || [],
        preferredChannel: merged.relationship?.preferredChannel,
        interests: merged.relationship?.interests || merged.interests
      };

      merged.decisions = {
        commitments: merged.decisions?.commitments || [],
        nextAction: merged.decisions?.nextAction,
        decisions: merged.decisions?.decisions || []
      };

      return merged;
    } catch (err) {
      logger.error('[AI Memory] Failed to aggregate hierarchical facts:', err);
      return {};
    }
  },

  /**
   * Persists updated facts back to the active session metadata.
   */
  async saveFacts(sessionId: string, facts: ChatSessionFacts): Promise<void> {
    try {
      const session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        select: { metadata: true }
      });
      
      const currentMeta = (session?.metadata as Record<string, any>) || {};
      
      const normalizedFacts: ChatSessionFacts = { ...facts };
      
      if (normalizedFacts.identity) {
        normalizedFacts.name = normalizedFacts.identity.name || normalizedFacts.name;
        normalizedFacts.company = normalizedFacts.identity.company || normalizedFacts.company;
        normalizedFacts.email = normalizedFacts.identity.email || normalizedFacts.email;
        normalizedFacts.phone = normalizedFacts.identity.phone || normalizedFacts.phone;
      } else {
        normalizedFacts.identity = {
          name: normalizedFacts.name,
          company: normalizedFacts.company,
          email: normalizedFacts.email,
          phone: normalizedFacts.phone
        };
      }

      if (normalizedFacts.business) {
        normalizedFacts.budget = normalizedFacts.business.budget || normalizedFacts.budget;
        normalizedFacts.timeline = normalizedFacts.business.timeline || normalizedFacts.timeline;
        normalizedFacts.goals = normalizedFacts.business.goals || normalizedFacts.goals;
        normalizedFacts.challenges = normalizedFacts.business.challenges || normalizedFacts.challenges;
        normalizedFacts.industry = normalizedFacts.business.industry || normalizedFacts.industry;
      } else {
        normalizedFacts.business = {
          budget: normalizedFacts.budget,
          timeline: normalizedFacts.timeline,
          goals: normalizedFacts.goals,
          challenges: normalizedFacts.challenges,
          industry: normalizedFacts.industry
        };
      }

      if (normalizedFacts.relationship) {
        normalizedFacts.interests = normalizedFacts.relationship.interests || normalizedFacts.interests;
      } else {
        normalizedFacts.relationship = {
          interests: normalizedFacts.interests
        };
      }

      await prisma.chatSession.update({
        where: { id: sessionId },
        data: {
          metadata: {
            ...currentMeta,
            facts: normalizedFacts
          } as any
        }
      });
      
      logger.info(`[AI Memory] Saved facts for session ${sessionId}: ${JSON.stringify(normalizedFacts)}`);
    } catch (err) {
      logger.error('[AI Memory] Failed to save facts to session:', err);
    }
  },

  /**
   * Heuristic rules scanner to parse fields incrementally from the latest user/assistant turn.
   */
  learnFactsIncremental(
    userMessage: string,
    assistantResponse: string,
    existingFacts: ChatSessionFacts
  ): ChatSessionFacts {
    const text = (userMessage + ' ' + assistantResponse).toLowerCase();
    const updated = { ...existingFacts };

    // 1. Scan for emails
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const emailMatch = text.match(emailRegex);
    if (emailMatch && emailMatch.length > 0) {
      updated.email = emailMatch[0];
    }

    // 2. Scan for phone numbers
    const phoneRegex = /(\+?[0-9]{10,13})/g;
    const phoneMatch = text.replace(/[\s-]/g, '').match(phoneRegex);
    if (phoneMatch && phoneMatch.length > 0) {
      updated.phone = phoneMatch[0];
    }

    // 3. Scan for industry keywords
    const industriesMap: Record<string, string[]> = {
      supermarket: ['supermarket', 'grocery', 'duka la chakula'],
      pharmacy: ['pharmacy', 'chemist', 'dawa', 'afya'],
      school: ['school', 'academy', 'shule', 'chuo'],
      restaurant: ['restaurant', 'cafe', 'mgahawa', 'bar'],
      salon: ['salon', 'barbershop', 'urembo', 'kinyozi'],
      retail: ['retail', 'wholesale', 'duka', 'clothing', 'hardware']
    };

    for (const [ind, keywords] of Object.entries(industriesMap)) {
      if (keywords.some(k => text.includes(k))) {
        updated.industry = ind;
        break;
      }
    }

    // 4. Name extraction
    if (userMessage.toLowerCase().includes('naitwa') || userMessage.toLowerCase().includes('name is')) {
      const words = userMessage.split(/\s+/);
      const triggers = ['naitwa', 'is'];
      const index = words.findIndex(w => triggers.includes(w.toLowerCase()));
      if (index !== -1 && index + 1 < words.length) {
        updated.name = words[index + 1].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
      }
    }

    return updated;
  },

  /**
   * Compresses older messages (exceeding latest 10 messages) into a dynamic contextSummary text block.
   */
  async summarizeSessionHistory(sessionId: string): Promise<void> {
    try {
      const conversations = await prisma.aiConversation.findMany({
        where: { sessionId, role: { not: 'system' } },
        orderBy: { createdAt: 'asc' }
      });

      if (conversations.length > 10) {
        const oldest = conversations.slice(0, conversations.length - 10);
        logger.info(`[AI Memory] Compressing rolling context for session ${sessionId} (${oldest.length} old messages)...`);

        const oldestText = oldest
          .map(c => `${c.role === 'user' ? 'Visitor' : 'Assistant'}: ${c.content}`)
          .join('\n');

        const prompt = `You are Denis's system context summarizer. Summarize the following early chat conversation details between Visitor and Assistant into a single paragraph of business context. Focus on visitor profile, goals, stated name/company, and key inquiries. Keep it concise.

Early Conversation:
${oldestText}

Summary:`;

        const { getAIProvider } = await import('./providers');
        const provider = getAIProvider();
        const result = await provider.generate([{ role: 'user', content: prompt }]);
        const contextSummary = result.content.trim();

        const session = await prisma.chatSession.findUnique({
          where: { id: sessionId },
          select: { metadata: true }
        });
        const meta = (session?.metadata as Record<string, any>) || {};
        meta.contextSummary = contextSummary;

        await prisma.chatSession.update({
          where: { id: sessionId },
          data: { metadata: meta }
        });

        logger.info(`[AI Memory] Rolling context compressed successfully for session: ${sessionId}`);
      }
    } catch (err) {
      logger.error('[AI Memory] Rolling context summarization failed:', err);
    }
  }
};
