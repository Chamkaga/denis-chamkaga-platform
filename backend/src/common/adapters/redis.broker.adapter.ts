// backend/src/common/adapters/redis.broker.adapter.ts
// Redis implementation of IMessageBroker interface

import { IMessageBroker, MessageEnvelope } from '../interfaces/message-broker.interface';
import { logger } from '../../utils/logger';

export class RedisBrokerAdapter implements IMessageBroker {
  private inMemoryQueue: Map<string, any[]> = new Map();
  private subscriptions: Map<string, Array<(msg: MessageEnvelope) => Promise<void>>> = new Map();

  async publish<T>(channel: string, message: MessageEnvelope<T>): Promise<void> {
    logger.debug(`[RedisBrokerAdapter] Published to ${channel}: ${message.event}`);
    const handlers = this.subscriptions.get(channel) || [];
    for (const handler of handlers) {
      try {
        await handler(message);
      } catch (err) {
        logger.error(`[RedisBrokerAdapter] Error in subscriber handler for channel ${channel}:`, err);
      }
    }
  }

  async subscribe<T>(channel: string, handler: (message: MessageEnvelope<T>) => Promise<void>): Promise<void> {
    const list = this.subscriptions.get(channel) || [];
    list.push(handler as any);
    this.subscriptions.set(channel, list);
  }

  async enqueue<T>(queueName: string, payload: T): Promise<void> {
    const queue = this.inMemoryQueue.get(queueName) || [];
    queue.push(payload);
    this.inMemoryQueue.set(queueName, queue);
  }

  async dequeue<T>(queueName: string): Promise<T | null> {
    const queue = this.inMemoryQueue.get(queueName) || [];
    if (queue.length === 0) return null;
    const item = queue.shift();
    this.inMemoryQueue.set(queueName, queue);
    return item as T;
  }

  async disconnect(): Promise<void> {
    this.subscriptions.clear();
    this.inMemoryQueue.clear();
  }
}

export const messageBroker = new RedisBrokerAdapter();
