import { TListener, logError } from './utils'

export class EventEmitter {
    private events: any = {}

    public on(event: string, listener: TListener): void {
        if ({}.toString.call(listener) !== '[object Function]') return logError('Listener must be a function')
        if (!this.events[event]) this.events[event] = listener
    }

    public emit(event: string, ...args: any[]): void {
        if (this.events[event]) this.events[event].call(null, ...args)
    }

    public removeAllEvents(): void {
        this.events = {}
    }
}