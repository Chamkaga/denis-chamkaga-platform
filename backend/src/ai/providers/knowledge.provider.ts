// src/ai/providers/knowledge.provider.ts
// Knowledge Provider interfaces and registry.

export interface KnowledgeDocument {
  id: string;
  source: 'experience' | 'project' | 'service' | 'industry' | 'technology' | 'case_study' | 'faq' | 'success_story' | 'future_vision' | 'ai_knowledge';
  title: string;
  content: string;
}

export interface KnowledgeProvider {
  name: string;
  isEnabled(): boolean;
  retrieve(query: string, limit: number): Promise<KnowledgeDocument[]>;
}

// Registry containing active knowledge providers
export const KNOWLEDGE_PROVIDERS_REGISTRY: Record<string, KnowledgeProvider> = {};

export function registerKnowledgeProvider(provider: KnowledgeProvider) {
  KNOWLEDGE_PROVIDERS_REGISTRY[provider.name] = provider;
}
