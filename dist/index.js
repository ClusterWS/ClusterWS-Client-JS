"use strict";

var LogLevel;

!function(e) {
    e[e.ALL = 0] = "ALL", e[e.DEBUG = 1] = "DEBUG", e[e.INFO = 2] = "INFO", e[e.WARN = 3] = "WARN", 
    e[e.ERROR = 4] = "ERROR";
}(LogLevel || (LogLevel = {}));

var Logger = function() {
    function e(e) {
        this.level = e;
    }
    return e.prototype.debug = function() {
        for (var e = [], t = 0; t < arguments.length; t++) e[t] = arguments[t];
        this.level > LogLevel.DEBUG || console.log.apply(console, [ "[36mdebug:[0m" ].concat(e.map(function(e) {
            return "object" == typeof e ? JSON.stringify(e) : e;
        })));
    }, e.prototype.info = function() {
        for (var e = [], t = 0; t < arguments.length; t++) e[t] = arguments[t];
        this.level > LogLevel.INFO || console.log.apply(console, [ "[32minfo:[0m" ].concat(e));
    }, e.prototype.error = function() {
        for (var e = [], t = 0; t < arguments.length; t++) e[t] = arguments[t];
        this.level > LogLevel.ERROR || console.log.apply(console, [ "[31merror:[0m" ].concat(e));
    }, e.prototype.warning = function() {
        for (var e = [], t = 0; t < arguments.length; t++) e[t] = arguments[t];
        this.level > LogLevel.WARN || console.log.apply(console, [ "[33mwarning:[0m" ].concat(e));
    }, e;
}();

function isFunction(e) {
    return "function" == typeof e;
}

var EventEmitter = function() {
    function e(e) {
        this.logger = e, this.events = {};
    }
    return e.prototype.on = function(e, t) {
        if (!isFunction(t)) return this.logger.error("Listener must be a function");
        this.events[e] = t;
    }, e.prototype.emit = function(e) {
        for (var t = [], o = 1; o < arguments.length; o++) t[o - 1] = arguments[o];
        var n = this.events[e];
        n && n.apply(void 0, t);
    }, e.prototype.exist = function(e) {
        return !!this.events[e];
    }, e.prototype.off = function(e) {
        delete this.events[e];
    }, e.prototype.removeEvents = function() {
        this.events = {};
    }, e;
}(), Socket = window.MozWebSocket || window.WebSocket, PONG = new Uint8Array([ "A".charCodeAt(0) ]).buffer, ClusterWSClient = function() {
    function e(e) {
        if (this.options = {
            url: e.url,
            autoConnect: !1 !== e.autoConnect,
            autoReconnect: e.autoReconnect || !1,
            autoResubscribe: !1 !== e.autoResubscribe,
            autoReconnectOptions: {
                attempts: e.autoReconnectOptions && e.autoReconnectOptions.attempts || 0,
                minInterval: e.autoReconnectOptions && e.autoReconnectOptions.maxInterval || 500,
                maxInterval: e.autoReconnectOptions && e.autoReconnectOptions.maxInterval || 2e3
            },
            logger: e.loggerOptions && e.loggerOptions.logger ? e.loggerOptions.logger : new Logger(e.loggerOptions && e.loggerOptions.level || LogLevel.ALL)
        }, !this.options.url) return this.options.logger.error("url must be provided");
        this.emitter = new EventEmitter(this.options.logger), this.options.autoConnect && this.connect();
    }
    return Object.defineProperty(e.prototype, "OPEN", {
        get: function() {
            return this.socket.OPEN;
        },
        enumerable: !0,
        configurable: !0
    }), Object.defineProperty(e.prototype, "CLOSED", {
        get: function() {
            return this.socket.CLOSED;
        },
        enumerable: !0,
        configurable: !0
    }), Object.defineProperty(e.prototype, "readyState", {
        get: function() {
            return this.socket ? this.socket.readyState : 0;
        },
        enumerable: !0,
        configurable: !0
    }), Object.defineProperty(e.prototype, "binaryType", {
        get: function() {
            return this.socket.binaryType;
        },
        set: function(e) {
            this.socket.binaryType = e;
        },
        enumerable: !0,
        configurable: !0
    }), e.prototype.connect = function() {
        var e = this;
        if (this.isCreated) return this.options.logger.error("Connect event has been called multiple times");
        this.isCreated = !0, this.socket = new Socket(this.options.url), this.socket.onopen = function() {}, 
        this.socket.onclose = function(t, o) {
            e.isCreated = !1;
            var n = "number" == typeof t ? t : t.code, r = "number" == typeof t ? o : t.reason;
            if (e.emitter.emit("close", n, r), e.options.autoReconnect && 1e3 !== n && e.readyState === e.CLOSED) return setTimeout(function() {
                e.connect();
            }, Math.floor(Math.random() * (e.options.autoReconnectOptions.maxInterval - e.options.autoReconnectOptions.minInterval + 1)));
            e.emitter.removeEvents();
        }, this.socket.onmessage = function(t) {
            var o = t;
            t.data && (o = t.data), e.parsePing(o, function() {
                if (e.emitter.exist("message")) return e.emitter.emit("message", o);
                e.processMessage(o);
            });
        }, this.socket.onerror = function(t) {
            if (e.emitter.exist("error")) return e.emitter.emit("error", t);
            e.options.logger.error(t), e.close();
        };
    }, e.prototype.on = function(e, t) {
        this.emitter.on(e, t);
    }, e.prototype.close = function(e, t) {
        this.socket.close(e || 1e3, t);
    }, e.prototype.processMessage = function(e) {}, e.prototype.parsePing = function(e, t) {
        var o = this;
        if (1 === e.size || 1 === e.byteLength) {
            var n = function(e) {
                return 57 === new Uint8Array(e)[0] ? (o.socket.send(PONG), o.emitter.emit("ping")) : t();
            };
            if (e instanceof Blob) {
                var r = new FileReader();
                return r.onload = function(e) {
                    return n(e.srcElement.result);
                }, r.readAsArrayBuffer(e);
            }
            return n(e);
        }
        return t();
    }, e;
}();

module.exports = ClusterWSClient; module.exports.default = ClusterWSClient;
