// backend/src/common/interfaces/message-broker.interface.ts
// Decoupled enterprise message broker interface abstraction

export interface MessageEnvelope<T = any> {
  id: string;
  event: string;
  payload: T;
  correlationId?: string;
  timestamp: string;
}

export interface IMessageBroker {
  publish<T>(channel: string, message: MessageEnvelope<T>): Promise<void>;
  subscribe<T>(channel: string, handler: (message: MessageEnvelope<T>) => Promise<void>): Promise<void>;
  enqueue<T>(queueName: string, payload: T): Promise<void>;
  dequeue<T>(queueName: string): Promise<T | null>;
  disconnect(): Promise<void>;
}
