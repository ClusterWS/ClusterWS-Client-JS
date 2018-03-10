"use strict";

function logError(t) {
    return console.log(t);
}

var Channel = function() {
    function t(t, e) {
        this.name = e, this.socket = t, this.subscribe();
    }
    return t.prototype.watch = function(t) {
        return "[object Function]" !== {}.toString.call(t) ? logError("Listener must be a function") : (this.listener = t, 
        this);
    }, t.prototype.publish = function(t) {
        return this.socket.send(this.name, t, "publish"), this;
    }, t.prototype.unsubscribe = function() {
        this.socket.send("unsubscribe", this.name, "system"), this.socket.channels[this.name] = null;
    }, t.prototype.onMessage = function(t) {
        this.listener && this.listener.call(null, t);
    }, t.prototype.subscribe = function() {
        this.socket.send("subscribe", this.name, "system");
    }, t;
}(), EventEmitter = function() {
    function t() {
        this.events = {};
    }
    return t.prototype.on = function(t, e) {
        if ("[object Function]" !== {}.toString.call(e)) return logError("Listener must be a function");
        this.events[t] = e;
    }, t.prototype.emit = function(t) {
        for (var e, n = [], o = 1; o < arguments.length; o++) n[o - 1] = arguments[o];
        this.events[t] && (e = this.events[t]).call.apply(e, [ null ].concat(n));
    }, t.prototype.removeAllEvents = function() {
        this.events = {};
    }, t;
}();

function buffer(t) {
    for (var e = t.length, n = new Uint8Array(e), o = 0; o < e; o++) n[o] = t.charCodeAt(o);
    return n.buffer;
}

function decode(t, e) {
    var n = {
        e: function() {
            return t.events.emit(e["#"][1], e["#"][2]);
        },
        p: function() {
            return t.channels[e["#"][1]] && t.channels[e["#"][1]].onMessage(e["#"][2]);
        },
        s: {
            c: function() {
                t.pingInterval = setInterval(function() {
                    return t.missedPing++ > 2 && t.disconnect(4001, "Did not get pings");
                }, e["#"][2].ping), t.useBinary = e["#"][2].binary, t.events.emit("connect");
            }
        }
    };
    return "s" === e["#"][0] ? n[e["#"][0]][e["#"][1]] && n[e["#"][0]][e["#"][1]].call(null) : n[e["#"][0]] && n[e["#"][0]].call(null);
}

function encode(t, e, n) {
    var o = {
        emit: {
            "#": [ "e", t, e ]
        },
        publish: {
            "#": [ "p", t, e ]
        },
        system: {
            subscribe: {
                "#": [ "s", "s", e ]
            },
            unsubscribe: {
                "#": [ "s", "u", e ]
            }
        }
    };
    return "ping" === n ? t : JSON.stringify("system" === n ? o[n][t] : o[n]);
}

var ClusterWS = function() {
    function t(t) {
        return this.events = new EventEmitter(), this.channels = {}, this.useBinary = !1, 
        this.missedPing = 0, this.reconnectionAttempted = 0, t.url ? (this.options = {
            url: t.url,
            autoReconnect: t.autoReconnect || !1,
            autoReconnectOptions: t.autoReconnectOptions ? {
                attempts: t.autoReconnectOptions.attempts || 0,
                minInterval: t.autoReconnectOptions.minInterval || 1e3,
                maxInterval: t.autoReconnectOptions.maxInterval || 5e3
            } : {
                attempts: 0,
                minInterval: 1e3,
                maxInterval: 5e3
            }
        }, this.options.autoReconnectOptions.minInterval > this.options.autoReconnectOptions.maxInterval ? logError("minInterval option can not be more than maxInterval option") : void this.create()) : logError("Url must be provided and it must be string");
    }
    return t.prototype.on = function(t, e) {
        this.events.on(t, e);
    }, t.prototype.send = function(t, e, n) {
        void 0 === n && (n = "emit"), this.websocket.send(this.useBinary ? buffer(encode(t, e, n)) : encode(t, e, n));
    }, t.prototype.disconnect = function(t, e) {
        this.websocket.close(t || 1e3, e);
    }, t.prototype.subscribe = function(t) {
        return this.channels[t] ? this.channels[t] : this.channels[t] = new Channel(this, t);
    }, t.prototype.getChannelByName = function(t) {
        return this.channels[t];
    }, t.prototype.getState = function() {
        return this.websocket.readyState;
    }, t.prototype.create = function() {
        var t = this, e = window.MozWebSocket || window.WebSocket;
        this.websocket = new e(this.options.url), this.websocket.binaryType = "arraybuffer", 
        this.websocket.onopen = function() {
            t.reconnectionAttempted = 0;
            for (var e = 0, n = Object.keys(t.channels), o = n.length; e < o; e++) t.channels[n[e]] && t.channels[n[e]].subscribe();
        }, this.websocket.onerror = function(e) {
            return t.events.emit("error", e);
        }, this.websocket.onmessage = function(e) {
            var n = "string" != typeof e.data ? String.fromCharCode.apply(null, new Uint8Array(e.data)) : e.data;
            if ("#0" === n) return t.missedPing = 0, t.send("#1", null, "ping");
            try {
                n = JSON.parse(n);
            } catch (t) {
                return logError(t);
            }
            decode(t, n);
        }, this.websocket.onclose = function(e) {
            if (t.missedPing = 0, clearInterval(t.pingInterval), t.events.emit("disconnect", e.code, e.reason), 
            t.options.autoReconnect && 1e3 !== e.code && (0 === t.options.autoReconnectOptions.attempts || t.reconnectionAttempted < t.options.autoReconnectOptions.attempts)) t.websocket.readyState === t.websocket.CLOSED ? (t.reconnectionAttempted++, 
            t.websocket = void 0, setTimeout(function() {
                return t.create();
            }, Math.floor(Math.random() * (t.options.autoReconnectOptions.maxInterval - t.options.autoReconnectOptions.minInterval + 1)))) : console.log("Some thing wrong with close event please contact developer"); else {
                t.events.removeAllEvents();
                for (var n = 0, o = Object.keys(t), s = o.length; n < s; n++) t[o[n]] = null;
            }
        };
    }, t;
}();

module.exports = ClusterWS, module.exports.default = ClusterWS;
