// src/ai/providers/index.ts
// OpenAI is the only LLM provider. Provider abstraction kept for future extensibility.

import { LLMProvider } from './provider.interface';
import { OpenAIProvider } from './openai.provider';

export * from './provider.interface';
export * from './openai.provider';

export function getAIProvider(): LLMProvider {
  return new OpenAIProvider();
}
