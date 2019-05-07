"use strict";

var LogLevel;

!function(t) {
    t[t.ALL = 0] = "ALL", t[t.DEBUG = 1] = "DEBUG", t[t.INFO = 2] = "INFO", t[t.WARN = 3] = "WARN", 
    t[t.ERROR = 4] = "ERROR";
}(LogLevel || (LogLevel = {}));

var Logger = function() {
    function t(t) {
        this.level = t;
    }
    return t.prototype.debug = function() {
        for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
        this.level > LogLevel.DEBUG || console.log.apply(console, [ "[36mdebug:[0m" ].concat(t.map(function(t) {
            return "object" == typeof t ? JSON.stringify(t) : t;
        })));
    }, t.prototype.info = function() {
        for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
        this.level > LogLevel.INFO || console.log.apply(console, [ "[32minfo:[0m" ].concat(t));
    }, t.prototype.error = function() {
        for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
        this.level > LogLevel.ERROR || console.log.apply(console, [ "[31merror:[0m" ].concat(t));
    }, t.prototype.warning = function() {
        for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
        this.level > LogLevel.WARN || console.log.apply(console, [ "[33mwarning:[0m" ].concat(t));
    }, t;
}();

function isFunction(t) {
    return "function" == typeof t;
}

var EventEmitter = function() {
    function t(t) {
        this.logger = t, this.events = {};
    }
    return t.prototype.on = function(t, e) {
        if (!isFunction(e)) return this.logger.error("Listener must be a function");
        this.events[t] = e;
    }, t.prototype.emit = function(t) {
        for (var e = [], o = 1; o < arguments.length; o++) e[o - 1] = arguments[o];
        var n = this.events[t];
        n && n.apply(void 0, e);
    }, t.prototype.exist = function(t) {
        return !!this.events[t];
    }, t.prototype.off = function(t) {
        delete this.events[t];
    }, t.prototype.removeEvents = function() {
        this.events = {};
    }, t;
}(), Socket = window.MozWebSocket || window.WebSocket, PONG = new Uint8Array([ "A".charCodeAt(0) ]).buffer, ClusterWSClient = function() {
    function t(t) {
        if (this.reconnectAttempts = 0, this.options = {
            url: t.url,
            autoConnect: !1 !== t.autoConnect,
            autoReconnect: t.autoReconnect || !1,
            autoResubscribe: !1 !== t.autoResubscribe,
            autoReconnectOptions: {
                attempts: t.autoReconnectOptions && t.autoReconnectOptions.attempts || 0,
                minInterval: t.autoReconnectOptions && t.autoReconnectOptions.minInterval || 500,
                maxInterval: t.autoReconnectOptions && t.autoReconnectOptions.maxInterval || 2e3
            },
            logger: t.loggerOptions && t.loggerOptions.logger ? t.loggerOptions.logger : new Logger(t.loggerOptions && t.loggerOptions.level || LogLevel.ALL)
        }, !this.options.url) return this.options.logger.error("url must be provided");
        this.emitter = new EventEmitter(this.options.logger), this.reconnectAttempts = this.options.autoReconnectOptions.attempts, 
        this.options.autoConnect && this.connect();
    }
    return Object.defineProperty(t.prototype, "OPEN", {
        get: function() {
            return this.socket.OPEN;
        },
        enumerable: !0,
        configurable: !0
    }), Object.defineProperty(t.prototype, "CLOSED", {
        get: function() {
            return this.socket.CLOSED;
        },
        enumerable: !0,
        configurable: !0
    }), Object.defineProperty(t.prototype, "readyState", {
        get: function() {
            return this.socket ? this.socket.readyState : 0;
        },
        enumerable: !0,
        configurable: !0
    }), Object.defineProperty(t.prototype, "binaryType", {
        get: function() {
            return this.socket.binaryType;
        },
        set: function(t) {
            this.socket.binaryType = t;
        },
        enumerable: !0,
        configurable: !0
    }), t.prototype.connect = function() {
        var t = this;
        if (console.log("Creating"), this.isCreated) return this.options.logger.error("Connect event has been called multiple times");
        this.isCreated = !0, this.socket = new Socket(this.options.url), this.socket.onopen = function() {
            t.reconnectAttempts = t.options.autoReconnectOptions.attempts;
        }, this.socket.onclose = function(e, o) {
            t.isCreated = !1;
            var n = "number" == typeof e ? e : e.code, r = "number" == typeof e ? o : e.reason;
            if (t.emitter.emit("close", n, r), t.options.autoReconnect && 1e3 !== n && t.readyState === t.CLOSED && (0 === t.options.autoReconnectOptions.attempts || t.reconnectAttempts > 0)) return t.reconnectAttempts--, 
            setTimeout(function() {
                t.connect();
            }, Math.floor(Math.random() * (t.options.autoReconnectOptions.maxInterval - t.options.autoReconnectOptions.minInterval + 1)));
            t.emitter.removeEvents();
        }, this.socket.onmessage = function(e) {
            var o = e;
            e.data && (o = e.data), t.parsePing(o, function() {
                if (t.emitter.exist("message")) return t.emitter.emit("message", o);
                t.processMessage(o);
            });
        }, this.socket.onerror = function(e) {
            if (t.emitter.exist("error")) return t.emitter.emit("error", e);
            t.options.logger.error(e), t.close();
        };
    }, t.prototype.on = function(t, e) {
        this.emitter.on(t, e);
    }, t.prototype.close = function(t, e) {
        this.socket.close(t || 1e3, e);
    }, t.prototype.processMessage = function(t) {}, t.prototype.parsePing = function(t, e) {
        var o = this;
        if (1 === t.size || 1 === t.byteLength) {
            var n = function(t) {
                return 57 === new Uint8Array(t)[0] ? (o.socket.send(PONG), o.emitter.emit("ping")) : e();
            };
            if (t instanceof Blob) {
                var r = new FileReader();
                return r.onload = function(t) {
                    return n(t.srcElement.result);
                }, r.readAsArrayBuffer(t);
            }
            return n(t);
        }
        return e();
    }, t;
}();

module.exports = ClusterWSClient; module.exports.default = ClusterWSClient;
