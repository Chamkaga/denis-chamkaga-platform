export interface DomainEvent<T = unknown> {
  id: string;
  name: string;
  version: number;
  occurredAt: Date;
  correlationId: string;
  causationId?: string;
  actorId?: string;
  data: T;
}
