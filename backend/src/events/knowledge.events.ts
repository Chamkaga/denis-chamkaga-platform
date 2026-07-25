import { DomainEvent } from '@dc/shared';

export interface KnowledgeCreatedPayload {
  knowledgeItemId: string;
  title: string;
  category: string;
  authorId?: string;
}

export interface KnowledgeUpdatedPayload {
  knowledgeItemId: string;
  version: number;
  updatedFields: string[];
}

export interface KnowledgeDeletedPayload {
  knowledgeItemId: string;
}

export interface EmbeddingGeneratedPayload {
  knowledgeItemId: string;
  dimensions: number;
  provider: string;
}

export interface IndexCompletedPayload {
  totalItemsIndexed: number;
  durationMs: number;
}

export const createKnowledgeEvent = <T>(name: string, data: T, actorId?: string): DomainEvent<T> => ({
  id: `kb-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
  name,
  version: 1,
  occurredAt: new Date(),
  correlationId: `kb-corr-${Date.now()}`,
  actorId,
  data,
});
