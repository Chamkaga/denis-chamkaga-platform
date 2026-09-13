// src/ai/providers/knowledge.provider.ts
// Knowledge Provider interfaces and registry.

export type KnowledgeStatus = 'ACTIVE' | 'DEPRECATED' | 'DRAFT';
export type KnowledgeAudience = 'MARY' | 'ADMIN' | 'BOTH';
export type KnowledgeSourceType = 'STATIC' | 'DATABASE' | 'SYSTEM';

export interface KnowledgeDocument {
  id: string;
  source: string;
  sourceType: KnowledgeSourceType;
  sourceId?: string;
  sourceOfTruth: string;
  title: string;
  content: string;
  audience: KnowledgeAudience;
  status: KnowledgeStatus;
  version: string;
  priority?: number;
  effectiveFrom?: Date | string;
  expiresAt?: Date | string;
  language?: 'en' | 'sw' | 'both';
  keywords?: string[];
  domain?: string;
  qualityScore?: number;
  relationships?: string[];
}

export interface RetrievalContext {
  audience?: KnowledgeAudience;
  language?: 'en' | 'sw';
  userRole?: 'visitor' | 'admin' | 'super_admin' | 'client';
  traceId?: string;
}

export interface KnowledgeProvider {
  name: string;
  precedence: number; // 1 = Database, 2 = Static Adapter, 3 = Core Static / Fallback
  isEnabled(): boolean;
  retrieve(query: string, limit: number, context?: RetrievalContext): Promise<KnowledgeDocument[]>;
  invalidateCache?(): void;
}

// Registry containing active knowledge providers
export const KNOWLEDGE_PROVIDERS_REGISTRY: Record<string, KnowledgeProvider> = {};

export function registerKnowledgeProvider(provider: KnowledgeProvider) {
  KNOWLEDGE_PROVIDERS_REGISTRY[provider.name] = provider;
}

