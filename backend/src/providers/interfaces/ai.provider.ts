import { ProviderMetadata, ProviderCapabilities, ProviderHealth } from '@dc/shared';

export type SupportedAIProvider = 'openai' | 'gemini';

export interface IAIProvider {
  getMetadata(): ProviderMetadata;
  getCapabilities(): ProviderCapabilities;
  checkHealth(): Promise<ProviderHealth>;
  generateText(prompt: string, options?: { model?: string; maxTokens?: number }): Promise<{ text: string }>;
  generateEmbeddings(text: string): Promise<{ embeddings: number[] }>;
}
