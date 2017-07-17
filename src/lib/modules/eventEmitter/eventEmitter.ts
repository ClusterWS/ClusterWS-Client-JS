export class EventEmitter {
    _events: any = {};

    constructor() {}

    on(event: string, listener: any) {
        if (!listener) throw 'Function must be provided';
        if(this.exist(event)) return;
        return this._events[event] = listener;
    }

    emit(event: string, ...rest: any[]) {
        if (this.exist(event)) this._events[event].apply(this, rest);
    }

    removeEvent(event: string) {
        if (this.exist(event)) {
            this._events[event] = null;
            delete this._events[event];
        }
    }

    removeAllEvents() {
        for (let key in this._events) {
            if (this._events.hasOwnProperty(key)) {
                this._events[key] = null;
                delete this._events[key];
            }
        }
    }

    exist(event: string) {
        return this._events[event]
    }
}