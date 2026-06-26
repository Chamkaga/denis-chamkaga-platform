// src/ai/services/ollama.service.ts
// HTTP client for the Ollama local LLM API.
// The frontend NEVER talks to Ollama directly — always through this backend service.

import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { AppError } from '../../middleware/errorHandler';

export interface OllamaMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OllamaChatRequest {
  model: string;
  messages: OllamaMessage[];
  stream: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    num_predict?: number;
  };
}

export interface OllamaChatResponse {
  model: string;
  message: OllamaMessage;
  done: boolean;
  total_duration?: number;
  eval_count?: number;
}

export const ollamaService = {
  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${env.OLLAMA_URL}/api/tags`, {
        signal: AbortSignal.timeout(3000),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async chat(messages: OllamaMessage[]): Promise<string> {
    const request: OllamaChatRequest = {
      model: env.OLLAMA_MODEL,
      messages,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 1024,
      },
    };

    try {
      const response = await fetch(`${env.OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(60000), // 60s timeout for LLM
      });

      if (!response.ok) {
        const error = await response.text();
        logger.error(`Ollama API error: ${response.status} - ${error}`);
        throw new AppError(503, 'AI_ERROR', 'AI service temporarily unavailable');
      }

      const data = (await response.json()) as OllamaChatResponse;
      return data.message.content;
    } catch (err) {
      if (err instanceof AppError) throw err;
      logger.error('Ollama connection error:', err);
      throw new AppError(503, 'AI_UNAVAILABLE', 'AI assistant is currently offline. Please try again later.');
    }
  },
};
