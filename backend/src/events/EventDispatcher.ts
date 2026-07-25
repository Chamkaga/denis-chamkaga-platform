import { DomainEvent } from '@dc/shared';
import { IEventBus } from './IEventBus';

export class EventDispatcher {
  constructor(private eventBus: IEventBus) {}

  async dispatch<T>(event: DomainEvent<T>): Promise<void> {
    await this.eventBus.publish(event);
  }
}
