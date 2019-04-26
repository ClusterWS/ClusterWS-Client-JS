"use strict";

function isFunction(t) {
    return "function" == typeof t;
}

class EventEmitter {
    constructor(t) {
        this.logger = t, this.events = {};
    }
    on(t, e) {
        if (!isFunction(e)) return this.logger.error("Listener must be a function");
        this.events[t] = e;
    }
    emit(t, ...e) {
        const n = this.events[t];
        n && n(...e);
    }
    exist(t) {
        return !!this.events[t];
    }
    off(t) {
        delete this.events[t];
    }
    removeEvents() {
        this.events = {};
    }
}

const Socket = window.MozWebSocket || window.WebSocket;

class ClusterWS {
    constructor(t) {
        this.options = t, this.events = new EventEmitter({}), this.options.autoConnect && this.connect();
    }
    connect() {}
    on(t, e) {
        this.events.on(t, e);
    }
}

module.exports = ClusterWS; module.exports.default = ClusterWS;
