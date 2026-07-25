import { IAIProvider } from './interfaces/ai.provider';
import { OpenAIProviderDriver } from './drivers/openai.ai.driver';
import { GeminiProviderDriver } from './drivers/gemini.ai.driver';
import { ProviderMetadata, ProviderCapabilities, ProviderHealth } from '@dc/shared';

export class CompositeAIProvider implements IAIProvider {
  private primary: IAIProvider;
  private fallback: IAIProvider;

  constructor() {
    this.primary = new OpenAIProviderDriver();
    this.fallback = new GeminiProviderDriver();
  }

  getMetadata(): ProviderMetadata {
    return this.primary.getMetadata();
  }

  getCapabilities(): ProviderCapabilities {
    return this.primary.getCapabilities();
  }

  async checkHealth(): Promise<ProviderHealth> {
    return this.primary.checkHealth();
  }

  async generateText(prompt: string, options?: { model?: string; maxTokens?: number }): Promise<{ text: string }> {
    try {
      return await this.primary.generateText(prompt, options);
    } catch (err) {
      console.warn('[AI Provider Factory] OpenAI Primary failed. Falling back to Gemini Secondary.', err);
      return await this.fallback.generateText(prompt);
    }
  }

  async generateEmbeddings(text: string): Promise<{ embeddings: number[] }> {
    try {
      return await this.primary.generateEmbeddings(text);
    } catch (err) {
      console.warn('[AI Provider Factory] OpenAI Embedding failed. Falling back to Gemini Embedding.', err);
      return await this.fallback.generateEmbeddings(text);
    }
  }
}

export class AIProviderFactory {
  private static drivers: Record<string, IAIProvider> = {};

  /**
   * Returns the configured active AI Provider instance based on environment configuration.
   * Default production active provider: 'openai'.
   * Secondary providers (e.g., 'gemini') remain installed as future adapters but are disabled in runtime flow unless configured.
   */
  static getProvider(driverName?: string): IAIProvider {
    const activeDriver = driverName || process.env.ACTIVE_AI_PROVIDER || process.env.AI_PROVIDER || 'openai';

    if (!this.drivers[activeDriver]) {
      if (activeDriver === 'gemini') {
        this.drivers[activeDriver] = new GeminiProviderDriver();
      } else {
        this.drivers[activeDriver] = new OpenAIProviderDriver();
      }
    }
    return this.drivers[activeDriver];
  }
}
