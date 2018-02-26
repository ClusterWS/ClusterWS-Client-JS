"use strict";

function logError(e) {
    return console.log(e);
}

var Channel = function() {
    function e(e, n) {
        this.socket = e, this.name = n, this.subscribe();
    }
    return e.prototype.watch = function(e) {
        return "[object Function]" !== {}.toString.call(e) ? logError("Listener must be a function") : (this.listener = e, 
        this);
    }, e.prototype.publish = function(e) {
        return this.socket.send(this.name, e, "publish"), this;
    }, e.prototype.unsubscribe = function() {
        this.socket.send("unsubscribe", this.name, "system"), this.socket.channels[this.name] = null;
    }, e.prototype.onMessage = function(e) {
        this.listener && this.listener.call(null, e);
    }, e.prototype.subscribe = function() {
        this.socket.send("subscribe", this.name, "system");
    }, e;
}(), EventEmitter = function() {
    function e() {
        this.events = {};
    }
    return e.prototype.on = function(e, n) {
        if ("[object Function]" !== {}.toString.call(n)) return logError("Listener must be a function");
        this.events[e] = n;
    }, e.prototype.emit = function(e) {
        for (var n, t = [], o = 1; o < arguments.length; o++) t[o - 1] = arguments[o];
        this.events[e] && (n = this.events[e]).call.apply(n, [ null ].concat(t));
    }, e.prototype.removeAllEvents = function() {
        this.events = {};
    }, e;
}();

function buffer(e) {
    for (var n = e.length, t = new Uint8Array(n), o = 0; o < n; o++) t[o] = e.charCodeAt(o);
    return t.buffer;
}

function decode(e, n) {
    var t = {
        e: function() {
            return e.events.emit(n["#"][1], n["#"][2]);
        },
        p: function() {
            return e.channels[n["#"][1]] && e.channels[n["#"][1]].onMessage(n["#"][2]);
        },
        s: {
            c: function() {
                e.pingInterval = setInterval(function() {
                    return e.missedPing++ > 2 && e.disconnect(4001, "Did not get pings");
                }, n["#"][2].ping), e.useBinary = n["#"][2].binary, e.events.emit("connect");
            }
        }
    };
    return "s" === n["#"][0] ? t[n["#"][0]][n["#"][1]] && t[n["#"][0]][n["#"][1]].call(null) : t[n["#"][0]] && t[n["#"][0]].call(null);
}

function encode(e, n, t) {
    var o = {
        emit: {
            "#": [ "e", e, n ]
        },
        publish: {
            "#": [ "p", e, n ]
        },
        system: {
            subscribe: {
                "#": [ "s", "s", n ]
            },
            unsubscribe: {
                "#": [ "s", "u", n ]
            }
        }
    };
    return "ping" === t ? e : JSON.stringify("system" === t ? o[t][e] : o[t]);
}

var ClusterWS = function() {
    function e(e) {
        return this.events = new EventEmitter(), this.channels = {}, this.useBinary = !1, 
        this.missedPing = 0, this.inReconnection = !1, this.reconnectionAttempted = 0, e.url ? (this.options = {
            url: e.url,
            autoReconnect: e.autoReconnect || !1,
            reconnectionAttempts: e.reconnectionAttempts || 0,
            reconnectionIntervalMin: e.reconnectionIntervalMin || 1e3,
            reconnectionIntervalMax: e.reconnectionIntervalMax || 5e3
        }, this.options.reconnectionIntervalMin > this.options.reconnectionIntervalMax ? logError("reconnectionIntervalMin can not be more then reconnectionIntervalMax") : void this.create()) : logError("Url must be provided and it must be string");
    }
    return e.prototype.create = function() {
        var e = this, n = window.MozWebSocket || window.WebSocket;
        this.websocket = new n(this.options.url), this.websocket.binaryType = "arraybuffer", 
        this.websocket.onopen = function() {
            for (var n in e.reconnectionAttempted = 0, e.channels) e.channels[n] && e.channels[n].subscribe();
        }, this.websocket.onerror = function(n) {
            return e.events.emit("error", n);
        }, this.websocket.onmessage = function(n) {
            var t = "string" != typeof n.data ? String.fromCharCode.apply(null, new Uint8Array(n.data)) : n.data;
            if ("#0" === t) return e.missedPing = 0, e.send("#1", null, "ping");
            try {
                t = JSON.parse(t);
            } catch (e) {
                return logError(e);
            }
            decode(e, t);
        }, this.websocket.onclose = function(n) {
            if (e.missedPing = 0, clearInterval(e.pingInterval), e.events.emit("disconnect", n.code, n.reason), 
            e.options.autoReconnect && 1e3 !== n.code && (0 === e.options.reconnectionAttempts || e.reconnectionAttempted < e.options.reconnectionAttempts)) e.websocket.readyState === e.websocket.CLOSED && (e.reconnectionAttempted++, 
            e.websocket = null, setTimeout(function() {
                return e.create();
            }, Math.floor(Math.random() * (e.options.reconnectionIntervalMax - e.options.reconnectionIntervalMin + 1)))); else for (var t in e.events.removeAllEvents(), 
            e) e[t] && (e[t] = null);
        };
    }, e.prototype.on = function(e, n) {
        this.events.on(e, n);
    }, e.prototype.send = function(e, n, t) {
        void 0 === t && (t = "emit"), this.websocket.send(this.useBinary ? buffer(encode(e, n, t)) : encode(e, n, t));
    }, e.prototype.disconnect = function(e, n) {
        this.websocket.close(e || 1e3, n);
    }, e.prototype.subscribe = function(e) {
        return this.channels[e] ? this.channels[e] : this.channels[e] = new Channel(this, e);
    }, e.prototype.getChannelByName = function(e) {
        return this.channels[e];
    }, e.prototype.getState = function() {
        return this.websocket.readyState;
    }, e;
}();

module.exports = ClusterWS, module.exports.default = ClusterWS;
