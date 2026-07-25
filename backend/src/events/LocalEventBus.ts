import { EventEmitter } from 'events';
import { DomainEvent } from '@dc/shared';
import { IEventBus } from './IEventBus';
import { LoggerFactory } from '../utils/loggerFactory';

const logger = LoggerFactory.getLogger();

export class LocalEventBus implements IEventBus {
  private emitter = new EventEmitter();

  async publish<T>(event: DomainEvent<T>): Promise<void> {
    logger.info(`[EventBus] Publishing event: ${event.name}`, {
      requestId: event.correlationId,
      traceId: event.id
    });
    this.emitter.emit(event.name, event);
  }

  subscribe<T>(eventName: string, handler: (event: DomainEvent<T>) => Promise<void> | void): void {
    this.emitter.on(eventName, handler);
  }

  unsubscribe<T>(eventName: string, handler: (event: DomainEvent<T>) => Promise<void> | void): void {
    this.emitter.off(eventName, handler);
  }
}
