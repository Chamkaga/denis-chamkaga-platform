// src/ai/providers/gemini.provider.ts
// Google Gemini provider implementation of the common LLMProvider contract.

import { LLMProvider, ProviderMessage, GenerateOptions, ProviderResponse } from './provider.interface';
import { logger } from '../../utils/logger';
import { AppError } from '../../middleware/errorHandler';

/**
 * Stub implementation for Google Gemini API integration.
 * Demonstrates hot-swapping capacity of the AI Provider layer.
 */
export class GeminiProvider implements LLMProvider {
  private getApiKey(): string {
    return process.env.GEMINI_API_KEY || '';
  }

  async generate(messages: ProviderMessage[], options?: GenerateOptions): Promise<ProviderResponse> {
    logger.info('[Gemini Provider] Generating text response (stub)...');
    
    if (!this.getApiKey()) {
      logger.warn('Gemini API key is missing. Falling back to stub message.');
      return {
        content: "Gemini Provider Stub: API Key not set. Please set GEMINI_API_KEY in your .env variables.",
        tokensUsed: 0,
        durationMs: 10,
      };
    }

    throw new AppError(501, 'NOT_IMPLEMENTED', 'Gemini integration is not implemented yet.');
  }

  async stream(
    messages: ProviderMessage[],
    onToken: (token: string) => void,
    options?: GenerateOptions
  ): Promise<ProviderResponse> {
    logger.info('[Gemini Provider] Generating stream response (stub)...');
    
    if (!this.getApiKey()) {
      onToken("Gemini Provider Stream Stub: Please configure GEMINI_API_KEY.");
      return {
        content: "Stub output",
        tokensUsed: 0,
        durationMs: 10,
      };
    }

    throw new AppError(501, 'NOT_IMPLEMENTED', 'Gemini streaming integration is not implemented yet.');
  }

  async embed(text: string): Promise<number[]> {
    return new Array(1536).fill(0);
  }

  async healthCheck(): Promise<import('./provider.interface').HealthCheckResult> {
    const startTime = Date.now();
    const hasKey = this.getApiKey() !== '';
    return {
      provider: 'gemini',
      model: 'gemini-pro',
      status: hasKey ? 'healthy' : 'unhealthy',
      latencyMs: Date.now() - startTime,
      error: hasKey ? undefined : 'Gemini API key is missing.'
    };
  }
}
