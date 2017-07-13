export class EventEmitter {
    _events: any = {};

    constructor() {}

    on(event: string, listener: any) {
        if (!listener) throw 'Function must be provided';
        if(this._events[event]) return;
        return this._events[event] = listener;
    }

    emit(event: string, data?: any, param2?: any, param3?: any) {
        if (this._events[event]) {
            this._events[event](data, param2, param3);
        }
    }

    removeEvent(event: string) {
        if (this._events[event]) {
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