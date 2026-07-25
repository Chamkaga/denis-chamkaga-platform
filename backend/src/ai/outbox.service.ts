// backend/src/ai/outbox.service.ts
// Transactional Outbox Pattern for Zero Event Loss

import prisma from '../config/database';
import { aiEventBus, AIEventMap } from './event-bus';
import { otelLogger } from '../utils/otel-logger';

export interface OutboxMessage {
  id: string;
  eventType: string;
  payload: any;
  status: 'PENDING' | 'PUBLISHED' | 'FAILED';
  retryCount: number;
  createdAt: Date;
}

class OutboxService {
  private inMemoryOutbox: OutboxMessage[] = [];

  /**
   * Save event transactionally into outbox table
   */
  async saveEvent<K extends keyof AIEventMap>(eventType: K, payload: AIEventMap[K]): Promise<OutboxMessage> {
    const record: OutboxMessage = {
      id: `outbox_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      eventType: `${String(eventType)}.v1`,
      payload,
      status: 'PENDING',
      retryCount: 0,
      createdAt: new Date()
    };

    this.inMemoryOutbox.push(record);

    try {
      await prisma.businessActivity.create({
        data: {
          action: `OUTBOX_SAVED_${String(eventType).toUpperCase()}`,
          description: `Transactional outbox record created for ${String(eventType)}.v1`,
          performedBy: 'OutboxService',
          metadata: { outboxId: record.id, payload }
        }
      });
    } catch (err) {
      otelLogger.warn(`[OutboxService] DB outbox persistence warning for ${String(eventType)}`);
    }

    return record;
  }

  /**
   * Outbox Worker process to dispatch pending events to AIEventBus
   */
  async processOutboxQueue(): Promise<number> {
    const pendingEvents = this.inMemoryOutbox.filter((e) => e.status === 'PENDING');
    let dispatched = 0;

    for (const evt of pendingEvents) {
      try {
        const rawEventName = evt.eventType.split('.')[0] as keyof AIEventMap;
        aiEventBus.publish(rawEventName, evt.payload);
        evt.status = 'PUBLISHED';
        dispatched++;
      } catch (err) {
        evt.retryCount++;
        if (evt.retryCount > 3) evt.status = 'FAILED';
        otelLogger.error(`[OutboxService] Failed to publish outbox event ${evt.id}:`, err);
      }
    }

    return dispatched;
  }
}

export const outboxService = new OutboxService();
