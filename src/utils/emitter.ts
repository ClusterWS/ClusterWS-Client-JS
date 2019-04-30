import { Listener } from './types';
import { isFunction } from './helpers';

export class EventEmitter {
  private events: { [key: string]: Listener } = {};

  // TODO: add logger
  constructor(private logger: any) { }

  public on(event: string, listener: Listener): void {
    if (!isFunction(listener)) {
      return this.logger.error('Listener must be a function');
    }

    this.events[event] = listener;
  }

  public emit(event: string, ...args: any[]): void {
    const listener: Listener = this.events[event];
    listener && listener(...args);
  }

  public exist(event: string): boolean {
    return !!this.events[event];
  }

  public off(event: string): void {
    delete this.events[event];
  }

  public removeEvents(): void {
    this.events = {};
  }
}