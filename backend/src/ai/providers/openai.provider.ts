// src/ai/providers/openai.provider.ts
// OpenAI provider implementation of the common LLMProvider contract using the official SDK.

import { LLMProvider, ProviderMessage, GenerateOptions, ProviderResponse } from './provider.interface';
import { logger } from '../../utils/logger';
import { AppError } from '../../middleware/errorHandler';
import { env } from '../../config/env';
import OpenAI from 'openai';

import { GeminiProviderDriver } from '../../providers/drivers/gemini.ai.driver';

export class OpenAIProvider implements LLMProvider {
  private getApiKey(): string {
    return env.OPENAI_API_KEY || process.env.OPENAI_API_KEY || '';
  }

  private getModel(): string {
    return env.OPENAI_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  private getClient(): OpenAI {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new AppError(401, 'UNAUTHORIZED', 'OpenAI API key is missing. Set OPENAI_API_KEY.');
    }
    return new OpenAI({ apiKey });
  }

  async generate(messages: ProviderMessage[], options?: GenerateOptions): Promise<ProviderResponse> {
    const startTime = Date.now();
    try {
      const client = this.getClient();
      const response = await client.chat.completions.create({
        model: options?.model || this.getModel(),
        messages: messages.map(m => ({ role: m.role as any, content: m.content })),
      });

      const durationMs = Date.now() - startTime;
      const content = response.choices[0]?.message?.content || '';
      const tokensUsed = response.usage?.total_tokens || 0;

      return {
        content,
        tokensUsed,
        durationMs
      };
    } catch (err: any) {
      logger.error('[OpenAIProvider] OpenAI API execution failed:', { error: err.message, stack: err.stack });
      throw err;
    }
  }

  async stream(
    messages: ProviderMessage[],
    onToken: (token: string) => void,
    options?: GenerateOptions
  ): Promise<ProviderResponse> {
    const startTime = Date.now();
    try {
      const client = this.getClient();
      const streamResponse = await client.chat.completions.create({
        model: options?.model || this.getModel(),
        messages: messages.map(m => ({ role: m.role as any, content: m.content })),
        stream: true
      });

      let content = '';
      for await (const chunk of streamResponse) {
        const token = chunk.choices[0]?.delta?.content || '';
        if (token) {
          content += token;
          onToken(token);
        }
      }

      const durationMs = Date.now() - startTime;
      return {
        content,
        tokensUsed: 0,
        durationMs
      };
    } catch (err: any) {
      logger.error('[OpenAIProvider] OpenAI API stream failed:', { error: err.message, stack: err.stack });
      throw err;
    }
  }

  async embed(text: string): Promise<number[]> {
    const apiKey = this.getApiKey();
    if (!apiKey) return new Array(1536).fill(0);
    try {
      const client = new OpenAI({ apiKey });
      const response = await client.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });
      return response.data[0]?.embedding || new Array(1536).fill(0);
    } catch (err: any) {
      logger.error('[OpenAIProvider] OpenAI Embedding failed:', { error: err.message });
      return new Array(1536).fill(0);
    }
  }

  async healthCheck(): Promise<import('./provider.interface').HealthCheckResult> {
    const startTime = Date.now();
    const key = this.getApiKey();
    if (!key) {
      return {
        provider: 'openai',
        model: this.getModel(),
        status: 'unhealthy',
        latencyMs: 0,
        error: 'OpenAI API key is missing.'
      };
    }
    try {
      const client = new OpenAI({ apiKey: key });
      await client.models.list();
      return {
        provider: 'openai',
        model: this.getModel(),
        status: 'healthy',
        latencyMs: Date.now() - startTime,
        version: 'v1'
      };
    } catch (err: any) {
      return {
        provider: 'openai',
        model: this.getModel(),
        status: 'unhealthy',
        latencyMs: Date.now() - startTime,
        error: err.message
      };
    }
  }
}
