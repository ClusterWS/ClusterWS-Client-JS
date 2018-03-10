import { Listener } from '../utils/types'
import { logError } from '../utils/functions'

export class EventEmitter {
  private events: any = {}

  public on(event: string, listener: Listener): void {
    if ({}.toString.call(listener) !== '[object Function]')
      return logError('Listener must be a function')
    this.events[event] = listener
  }

  public emit(event: string, ...args: any[]): void {
    if (this.events[event]) this.events[event].call(null, ...args)
  }

  public removeAllEvents(): void {
    this.events = {}
  }
}