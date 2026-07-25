import { DomainEvent } from '@dc/shared';

export interface IEventBus {
  publish<T>(event: DomainEvent<T>): Promise<void>;
  subscribe<T>(eventName: string, handler: (event: DomainEvent<T>) => Promise<void> | void): void;
  unsubscribe<T>(eventName: string, handler: (event: DomainEvent<T>) => Promise<void> | void): void;
}
