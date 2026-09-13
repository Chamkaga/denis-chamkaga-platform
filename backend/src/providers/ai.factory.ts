import { IAIProvider } from './interfaces/ai.provider';
import { OpenAIProviderDriver } from './drivers/openai.ai.driver';
import { ProviderMetadata, ProviderCapabilities, ProviderHealth } from '@dc/shared';

export class CompositeAIProvider implements IAIProvider {
  private primary: IAIProvider;

  constructor() {
    this.primary = new OpenAIProviderDriver();
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
    return this.primary.generateText(prompt, options);
  }

  async generateEmbeddings(text: string): Promise<{ embeddings: number[] }> {
    return this.primary.generateEmbeddings(text);
  }
}

export class AIProviderFactory {
  private static drivers: Record<string, IAIProvider> = {};

  /**
   * Returns the configured active AI Provider instance based on environment configuration.
   * Default production active provider: 'openai'.
   * OpenAI is the sole supported runtime provider.
   */
  static getProvider(driverName?: string): IAIProvider {
    const requestedDriver = driverName || process.env.ACTIVE_AI_PROVIDER || process.env.AI_PROVIDER || 'openai';
    if (requestedDriver.toLowerCase() !== 'openai') {
      throw new Error(`Unsupported AI provider "${requestedDriver}". This platform is configured for OpenAI only.`);
    }
    const activeDriver = 'openai';

    if (!this.drivers[activeDriver]) {
      this.drivers[activeDriver] = new OpenAIProviderDriver();
    }
    return this.drivers[activeDriver];
  }
}
