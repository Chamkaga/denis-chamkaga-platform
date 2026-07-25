import { EventHandler } from './EventHandler';

export class EventRegistry {
  private handlers: Map<string, EventHandler<any>[]> = new Map();

  register<T>(eventName: string, handler: EventHandler<T>): void {
    const existing = this.handlers.get(eventName) || [];
    existing.push(handler);
    this.handlers.set(eventName, existing);
  }

  getHandlers<T>(eventName: string): EventHandler<T>[] {
    return this.handlers.get(eventName) || [];
  }

  clear(): void {
    this.handlers.clear();
  }
}
