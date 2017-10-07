export class EventEmitter {
    events: any = {}

    on(event: string, listener: any): void {
        if (!this.events[event]) this.events[event] = listener
    }

    emit(event: string, ...args: any[]): void {
        if (this.events[event]) this.events[event].call(null, ...args)
    }

    removeAllEvents(): void {
        this.events = {}
    }
}