// backend/src/ai/event-store.service.ts
// Immutable Event Store Service for Event Sourcing & Auditability

import prisma from '../config/database';
import { otelLogger } from '../utils/otel-logger';

export interface StoredEventRecord {
  id: string;
  eventName: string;
  payload: any;
  correlationId?: string;
  createdAt: Date;
}

class EventStoreService {
  private inMemoryStore: StoredEventRecord[] = [];

  async recordEvent(eventName: string, payload: any, correlationId?: string): Promise<StoredEventRecord> {
    const record: StoredEventRecord = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      eventName,
      payload,
      correlationId,
      createdAt: new Date()
    };

    this.inMemoryStore.push(record);

    try {
      await prisma.businessActivity.create({
        data: {
          action: `EVENT_STORE_${eventName.toUpperCase()}`,
          description: `Immutable Event Sourced: ${eventName}`,
          performedBy: 'EventStoreService',
          metadata: { recordId: record.id, correlationId, payload }
        }
      });
    } catch (err) {
      otelLogger.warn(`[EventStore] Failed to persist event ${eventName} to businessActivity table.`);
    }

    return record;
  }

  async getEventsByCorrelationId(correlationId: string): Promise<StoredEventRecord[]> {
    return this.inMemoryStore.filter((e) => e.correlationId === correlationId);
  }

  async getAllEvents(): Promise<StoredEventRecord[]> {
    return [...this.inMemoryStore];
  }
}

export const eventStoreService = new EventStoreService();
