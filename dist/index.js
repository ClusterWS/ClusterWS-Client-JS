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
        for (var t = [], n = 1; n < arguments.length; n++) t[n - 1] = arguments[n];
        var o = this.events[e];
        o && o.apply(void 0, t);
    }, e.prototype.exist = function(e) {
        return !!this.events[e];
    }, e.prototype.off = function(e) {
        delete this.events[e];
    }, e.prototype.removeEvents = function() {
        this.events = {};
    }, e;
}();

function decode(e, t) {
    var n = t[0], o = t[1], i = t[2];
    if ("e" === n) return e.emitter.emit(o, i);
    if ("p" === n) for (var r = 0, s = (l = Object.keys(i)).length; r < s; r++) for (var c = i[p = l[r]], a = 0, u = c.length; a < u; a++) e.channels.channelNewMessage(p, c[a]);
    if ("s" === n) {
        if ("s" === o) {
            var l;
            for (r = 0, s = (l = Object.keys(i)).length; r < s; r++) {
                var p = l[r];
                e.channels.channelSetStatus(p, i[p]);
            }
        }
        "c" === o && (e.autoPing = i.autoPing, e.pingInterval = i.pingInterval, e.resetPing(), 
        console.log(e));
    }
}

function encode(e, t, n) {
    var o = {
        emit: [ "e", e, t ],
        publish: [ "p", e, t ],
        system: {
            subscribe: [ "s", "s", t ],
            unsubscribe: [ "s", "u", t ],
            configuration: [ "s", "c", t ]
        }
    };
    return "system" === n ? JSON.stringify(o[n][e]) : JSON.stringify(o[n]);
}

var Channel = function() {
    function e(e, t, n) {
        this.client = e, this.name = t, this.listener = n, this.READY = 1, this.status = 0, 
        this.events = {}, this.client.readyState === this.client.OPEN && this.client.send("subscribe", [ this.name ], "system");
    }
    return e.prototype.on = function(e, t) {
        this.events[e] = t;
    }, e.prototype.publish = function(e) {
        this.status === this.READY && this.client.send(this.name, e, "publish");
    }, e.prototype.unsubscribe = function() {
        this.status = 0, this.emit("unsubscribed"), this.client.channels.removeChannel(this.name), 
        this.client.send("unsubscribe", this.name, "system");
    }, e.prototype.emit = function(e) {
        var t = this.events[e];
        t && t();
    }, e;
}(), Channels = function() {
    function e(e) {
        this.client = e, this.channels = {};
    }
    return e.prototype.subscribe = function(e, t) {
        if (!this.channels[e]) {
            var n = new Channel(this.client, e, t);
            return this.channels[e] = n, n;
        }
    }, e.prototype.resubscribe = function() {
        var e = Object.keys(this.channels);
        e.length && this.client.send("subscribe", e, "system");
    }, e.prototype.getChannelByName = function(e) {
        return this.channels[e] || null;
    }, e.prototype.channelNewMessage = function(e, t) {
        var n = this.channels[e];
        n && n.status === n.READY && n.listener(t);
    }, e.prototype.channelSetStatus = function(e, t) {
        var n = this.channels[e];
        if (n) {
            if (!t) return n.emit("canceled"), this.removeChannel(e);
            n.status = 1, n.emit("subscribed");
        }
    }, e.prototype.removeChannel = function(e) {
        delete this.channels[e];
    }, e.prototype.removeAllChannels = function() {
        this.channels = {};
    }, e;
}(), Socket = window.MozWebSocket || window.WebSocket, PONG = new Uint8Array([ "A".charCodeAt(0) ]).buffer, ClusterWSClient = function() {
    function e(e) {
        if (this.reconnectAttempts = 0, this.options = {
            url: e.url,
            autoConnect: !1 !== e.autoConnect,
            autoReconnect: e.autoReconnect || !1,
            autoResubscribe: !1 !== e.autoResubscribe,
            autoReconnectOptions: {
                attempts: e.autoReconnectOptions && e.autoReconnectOptions.attempts || 0,
                minInterval: e.autoReconnectOptions && e.autoReconnectOptions.minInterval || 500,
                maxInterval: e.autoReconnectOptions && e.autoReconnectOptions.maxInterval || 2e3
            },
            logger: e.loggerOptions && e.loggerOptions.logger ? e.loggerOptions.logger : new Logger(e.loggerOptions && e.loggerOptions.level || LogLevel.ALL)
        }, !this.options.url) return this.options.logger.error("url must be provided");
        this.emitter = new EventEmitter(this.options.logger), this.channels = new Channels(this), 
        this.reconnectAttempts = this.options.autoReconnectOptions.attempts, this.options.autoConnect && this.connect();
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
        this.isCreated = !0, this.socket = new Socket(this.options.url), this.socket.onopen = function() {
            e.reconnectAttempts = e.options.autoReconnectOptions.attempts, e.options.autoResubscribe ? e.channels.resubscribe() : e.channels.removeAllChannels(), 
            e.emitter.emit("open");
        }, this.socket.onclose = function(t, n) {
            clearTimeout(e.pingTimeout), e.isCreated = !1;
            var o = "number" == typeof t ? t : t.code, i = "number" == typeof t ? n : t.reason;
            if (e.emitter.emit("close", o, i), e.options.autoReconnect && 1e3 !== o && e.readyState === e.CLOSED && (0 === e.options.autoReconnectOptions.attempts || e.reconnectAttempts > 0)) return e.reconnectAttempts--, 
            setTimeout(function() {
                e.connect();
            }, Math.floor(Math.random() * (e.options.autoReconnectOptions.maxInterval - e.options.autoReconnectOptions.minInterval + 1)));
            e.emitter.removeEvents(), e.channels.removeAllChannels();
        }, this.socket.onmessage = function(t) {
            var n = t;
            t.data && (n = t.data), e.parsePing(n, function() {
                if (e.emitter.exist("message")) return e.emitter.emit("message", n);
                e.processMessage(n);
            });
        }, this.socket.onerror = function(t) {
            if (e.emitter.exist("error")) return e.emitter.emit("error", t);
            e.options.logger.error(t), e.close();
        };
    }, e.prototype.on = function(e, t) {
        this.emitter.on(e, t);
    }, e.prototype.send = function(e, t, n) {
        return void 0 === n && (n = "emit"), void 0 === t ? this.socket.send(e) : this.socket.send(encode(e, t, n));
    }, e.prototype.close = function(e, t) {
        this.socket.close(e || 1e3, t);
    }, e.prototype.subscribe = function(e, t) {
        return this.channels.subscribe(e, t);
    }, e.prototype.getChannelByName = function(e) {
        return this.channels.getChannelByName(e);
    }, e.prototype.processMessage = function(e) {
        try {
            if (e instanceof Array) return decode(this, e);
            if ("string" != typeof e) {
                var t = new Error("processMessage accepts only string or array types");
                if (this.emitter.exist("error")) return this.emitter.emit("error", t);
                throw t;
            }
            if ("[" !== e[0]) {
                t = new Error("processMessage received incorrect message");
                if (this.emitter.exist("error")) return this.emitter.emit("error", t);
                throw t;
            }
            return decode(this, JSON.parse(e));
        } catch (t) {
            if (this.emitter.exist("error")) return this.emitter.emit("error", t);
            throw this.close(), t;
        }
    }, e.prototype.parsePing = function(e, t) {
        var n = this;
        if (1 === e.size || 1 === e.byteLength) {
            var o = function(e) {
                return 57 === new Uint8Array(e)[0] ? (n.resetPing(), n.socket.send(PONG), n.emitter.emit("ping")) : t();
            };
            if (e instanceof Blob) {
                var i = new FileReader();
                return i.onload = function(e) {
                    return o(e.srcElement.result);
                }, i.readAsArrayBuffer(e);
            }
            return o(e);
        }
        return t();
    }, e.prototype.resetPing = function() {
        var e = this;
        clearTimeout(this.pingTimeout), this.pingInterval && this.autoPing && (this.pingTimeout = setTimeout(function() {
            e.close(4001, "No ping received in " + (e.pingInterval + 500) + "ms");
        }, this.pingInterval + 500));
    }, e;
}();

module.exports = ClusterWSClient; module.exports.default = ClusterWSClient;
