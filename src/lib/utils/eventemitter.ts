import { _ } from './fp'
import { logError } from './common'

/* Custom EventEmitter */
export class EventEmitter {
    _events: any = {}

    on(event: string, listener: any) {
        if (!listener || typeof listener !== 'function') logError('Listener must be a function')
        this._events[event] ? this._events[event].push(listener) : this._events[event] = [listener]
    }

    emit(event: string, ...args: any[]) {
        _.map((listener: any) => listener.call(null, ...args), this._events[event])
    }

    removeAllEvents() {
        this._events = {}
    }
}

