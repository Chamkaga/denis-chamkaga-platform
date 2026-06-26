// src/controllers/ai.controller.ts

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { conversationService } from '../ai/services/conversation.service';
import { ollamaService } from '../ai/services/ollama.service';
import { ApiResponse } from '../types/api';

const chatSchema = z.object({
  message: z.string().min(1).max(2000, 'Message too long'),
  sessionId: z.string().optional(),
  visitorId: z.string().optional(),
});

export const aiController = {
  async chat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { message, sessionId, visitorId } = chatSchema.parse(req.body);
      const result = await conversationService.chat({ message, sessionId, visitorId });
      res.status(200).json({ success: true, data: result } satisfies ApiResponse);
    } catch (err) {
      next(err);
    }
  },

  async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const messages = await conversationService.getSessionHistory(sessionId);
      res.status(200).json({ success: true, data: { messages } } satisfies ApiResponse);
    } catch (err) {
      next(err);
    }
  },

  async health(req: Request, res: Response): Promise<void> {
    const available = await ollamaService.isAvailable();
    res.status(200).json({
      success: true,
      data: {
        status: available ? 'online' : 'offline',
        model: process.env.OLLAMA_MODEL || 'llama3.2',
      },
    } satisfies ApiResponse);
  },

  async closeSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      await conversationService.closeSession(sessionId);
      res.status(200).json({ success: true, data: { message: 'Session closed' } } satisfies ApiResponse);
    } catch (err) {
      next(err);
    }
  },
};
