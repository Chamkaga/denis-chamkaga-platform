// src/ai/services/conversation.service.ts
// Manages AI conversation sessions, builds the context window, detects intent,
// and orchestrates the full chat pipeline.

import prisma from '../../config/database';
import { ollamaService, OllamaMessage } from './ollama.service';
import { knowledgeService } from './knowledge.service';
import { logger } from '../../utils/logger';
import { AppError } from '../../middleware/errorHandler';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
  visitorId?: string;
}

export interface ChatResponse {
  message: string;
  sessionId: string;
  intent?: string;
  leadScore?: number;
}

// Keywords that indicate business interest (for lead scoring)
const LEAD_INTENT_KEYWORDS = {
  service_inquiry: ['price', 'cost', 'quote', 'how much', 'rates', 'pricing', 'hire', 'work with'],
  booking: ['book', 'appointment', 'schedule', 'meet', 'consultation', 'call', 'discuss'],
  project: ['project', 'build', 'develop', 'create', 'system', 'database', 'app', 'website'],
  contact: ['contact', 'email', 'phone', 'reach', 'whatsapp', 'message'],
};

function detectIntent(message: string): { intent: string; score: number } {
  const lower = message.toLowerCase();
  for (const [intent, keywords] of Object.entries(LEAD_INTENT_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) {
      return { intent, score: intent === 'service_inquiry' || intent === 'booking' ? 30 : 15 };
    }
  }
  return { intent: 'general_inquiry', score: 5 };
}

function buildSystemPrompt(context: Awaited<ReturnType<typeof knowledgeService.buildContext>>): string {
  const base = context.systemPrompt ||
    `You are Denis Chamkaga's Business Technology Assistant — a professional AI dedicated to Denis Chamkaga's digital office.

You ONLY discuss topics related to:
• Denis Chamkaga (his background, expertise, and professional journey)
• Portfolio and projects
• Services: Database Design, CRM Implementation, Business Automation, Digital Transformation, Custom Software, Technology Consulting
• Business systems, database design, CRM, and automation
• Technology consulting and digital transformation
• How to engage Denis for consultations or projects

If a visitor asks about unrelated topics (personal advice, cooking, news, general knowledge, etc.), politely explain:
"I'm Denis's Business Technology Assistant. I'm specialized to help you learn about Denis Chamkaga's expertise and services. Is there anything about his work or services I can help you with?"

Be professional, warm, and helpful. Encourage business conversations. If a visitor shows interest in services or projects, invite them to book a consultation.

Always respond in the same language the visitor uses (English or Swahili).`;

  return `${base}

--- KNOWLEDGE BASE (Always up-to-date from website) ---

ABOUT DENIS:
${context.about}

SERVICES OFFERED:
${context.services}

RECENT PROJECTS:
${context.projects}

PROFESSIONAL EXPERIENCE:
${context.experience}

EDUCATION:
${context.education}

SKILLS:
${context.skills}

--- END KNOWLEDGE BASE ---

Keep responses concise, professional, and action-oriented. When appropriate, encourage the visitor to book a consultation or reach out directly.`;
}

export const conversationService = {
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const { message, sessionId, visitorId } = request;

    // Get or create chat session
    let session = sessionId
      ? await prisma.chatSession.findUnique({ where: { id: sessionId } })
      : null;

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          visitorId,
          status: 'active',
          metadata: { userAgent: 'web' },
        },
      });
    }

    // Detect intent and score
    const { intent, score } = detectIntent(message);

    // Load conversation history (last 10 messages for context window)
    const history = await prisma.aiConversation.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'asc' },
      take: 20,
      select: { role: true, content: true },
    });

    // Build knowledge context
    const knowledge = await knowledgeService.buildContext();
    const systemPrompt = buildSystemPrompt(knowledge);

    // Build messages array for Ollama
    const messages: OllamaMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history.map(h => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user', content: message },
    ];

    // Call Ollama
    const assistantReply = await ollamaService.chat(messages);

    // Persist both messages to DB
    await prisma.$transaction([
      prisma.aiConversation.create({
        data: {
          sessionId: session.id,
          role: 'user',
          content: message,
          intent,
          confidence: score / 100,
        },
      }),
      prisma.aiConversation.create({
        data: {
          sessionId: session.id,
          role: 'assistant',
          content: assistantReply,
          intent: 'response',
        },
      }),
      prisma.chatSession.update({
        where: { id: session.id },
        data: {
          messageCount: { increment: 2 },
          leadScore: { increment: score },
        },
      }),
    ]);

    logger.info(`AI chat: session=${session.id} intent=${intent} score+${score}`);

    return {
      message: assistantReply,
      sessionId: session.id,
      intent,
      leadScore: session.leadScore + score,
    };
  },

  async getSessionHistory(sessionId: string): Promise<ChatMessage[]> {
    const messages = await prisma.aiConversation.findMany({
      where: { sessionId, role: { not: 'system' } },
      orderBy: { createdAt: 'asc' },
      select: { role: true, content: true },
    });

    return messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
  },

  async closeSession(sessionId: string): Promise<void> {
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { status: 'closed', endedAt: new Date() },
    });
  },
};
