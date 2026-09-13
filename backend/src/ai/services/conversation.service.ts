// src/ai/services/conversation.service.ts
// Manages AI conversation sessions by forwarding requests to the central AI Orchestrator
// and providing standard session lifecycle database mutations.

import { Response } from 'express';
import prisma from '../../config/database';
import { aiOrchestrator } from '../orchestrator';
import { logger } from '../../utils/logger';
import { aiEventBus } from '../event-bus';
import { sessionCapabilityService } from '../session-capability.service';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
  visitorId?: string;
  language?: 'en' | 'sw';
}

export const conversationService = {
  /**
   * Delegates the message chat request to the AI Orchestrator and writes streamed response chunks.
   */
  async chatStream(request: ChatRequest, res: Response): Promise<void> {
    try {
      const output = await aiOrchestrator.processMessage(
        {
          message: request.message,
          sessionId: request.sessionId,
          visitorId: request.visitorId,
          userRole: 'visitor', // Defaults to visitor for chat widget
          language: request.language
        },
        (token) => {
          // Write token stream chunk in Server-Sent Events (SSE) format
          res.write(`data: ${JSON.stringify({ token })}\n\n`);
        }
      );

      // Write closing session metadata block in SSE format
      res.write(`data: ${JSON.stringify({
        sessionId: output.sessionId,
        sessionCapability: sessionCapabilityService.issue(output.sessionId, output.visitorId),
        intent: output.intent,
        leadScore: output.leadScore,
        temperature: output.temperature,
        recommendation: output.recommendation,
        provider: output.provider,
        model: output.model,
        generationMode: output.generationMode,
        providerErrorCode: output.providerErrorCode
      })}\n\n`);
      
      res.end();
    } catch (err: any) {
      logger.error('[AI ConversationService] chatStream error:', err);
      const errorText = "Denis Assistant is temporarily unavailable. Please try again shortly.";
      res.write(`data: ${JSON.stringify({ token: errorText })}\n\n`);
      res.end();
    }
  },

  /**
   * Retrieves messages history list for the specified session (excluding system instruction frames).
   */
  async getSessionHistory(sessionId: string): Promise<ChatMessage[]> {
    const messages = await prisma.aiConversation.findMany({
      where: { sessionId, role: { not: 'system' } },
      orderBy: { createdAt: 'asc' },
      select: { role: true, content: true },
    });

    return messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }));
  },

  /**
   * Concludes the chat session, updating status and triggering event bus subscribers.
   */
  async closeSession(sessionId: string, feedbackRating?: number, feedbackComments?: string): Promise<void> {
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      select: { metadata: true, startedAt: true, leadScore: true }
    });

    const currentMeta = session?.metadata && typeof session.metadata === 'object'
      ? (session.metadata as Record<string, any>)
      : {};

    await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        status: 'closed',
        endedAt: new Date(),
        metadata: {
          ...currentMeta,
          feedback: {
            rating: feedbackRating || null,
            comments: feedbackComments || null,
            submittedAt: new Date().toISOString()
          }
        }
      },
    });

    const startedTime = session?.startedAt ? session.startedAt.getTime() : Date.now();
    const lScore = session?.leadScore || 0;

    aiEventBus.publish('ConversationEnded', {
      sessionId,
      durationMs: Date.now() - startedTime,
      feedbackRating,
      feedbackComments
    });

    aiEventBus.publish('ConversationCompleted', {
      sessionId,
      durationMs: Date.now() - startedTime,
      leadScore: lScore
    });
  },

  /**
   * Returns list of recorded chat sessions for the specified visitor tracking code.
   */
  async getVisitorSessions(visitorId: string) {
    const sessions = await prisma.chatSession.findMany({
      where: { visitorId },
      orderBy: { startedAt: 'desc' },
      select: {
        id: true,
        visitorId: true,
        status: true,
        startedAt: true,
        endedAt: true,
        messageCount: true,
        metadata: true,
      },
    });

    return sessions.map((s) => {
      const meta = s.metadata && typeof s.metadata === 'object' ? (s.metadata as Record<string, any>) : {};
      return {
        id: s.id,
        visitorId: s.visitorId,
        status: s.status,
        startedAt: s.startedAt,
        endedAt: s.endedAt,
        messageCount: s.messageCount,
        title: meta.title || `Chat on ${new Date(s.startedAt).toLocaleDateString()}`,
        facts: meta.facts || {}
      };
    });
  },

  /**
   * Sets a custom descriptive title override for the session sidebar labels.
   */
  async renameSession(sessionId: string, title: string): Promise<void> {
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      select: { metadata: true }
    });
    
    const currentMeta = session?.metadata && typeof session.metadata === 'object'
      ? (session.metadata as Record<string, any>)
      : {};
    
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        metadata: {
          ...currentMeta,
          title
        }
      }
    });
  },

  /**
   * Deletes a session history completely.
   */
  async deleteSession(sessionId: string): Promise<void> {
    await prisma.chatSession.delete({
      where: { id: sessionId }
    });
  }
};
