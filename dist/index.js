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
        const s = this.events[t];
        s && s(...e);
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

class ClusterWSClient {
    constructor(t) {
        this.options = t, this.events = new EventEmitter({}), this.options.autoConnect && this.connect();
    }
    connect() {
        if (this.isCreated) return console.log("Instance exists");
        this.isCreated = !0, this.socket = new Socket(this.options.url), this.socket.onopen = (() => {}), 
        this.socket.onclose = (() => {}), this.socket.onmessage = (() => {}), this.socket.onerror = (() => {});
    }
    on(t, e) {
        this.events.on(t, e);
    }
}

module.exports = ClusterWSClient; module.exports.default = ClusterWSClient;
