import { DomainEvent } from '@dc/shared';

export interface EventHandler<T> {
  handle(event: DomainEvent<T>): Promise<void> | void;
}
