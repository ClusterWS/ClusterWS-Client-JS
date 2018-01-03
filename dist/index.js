"use strict";

function logError(t) {
    return console.log(t);
}

var Channel = function() {
    function t(t, e) {
        this.socket = t, this.name = e, this.subscribe();
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
        for (var e = [], n = 1; n < arguments.length; n++) e[n - 1] = arguments[n];
        this.events[t] && (o = this.events[t]).call.apply(o, [ null ].concat(e));
        var o;
    }, t.prototype.removeAllEvents = function() {
        this.events = {};
    }, t;
}(), Reconnection = function() {
    function t(t) {
        this.socket = t, this.inReconnectionState = !1, this.reconnectionAttempted = 0, 
        this.autoReconnect = this.socket.options.autoReconnect;
    }
    return t.prototype.isConnected = function() {
        clearTimeout(this.timer), clearInterval(this.interval), this.inReconnectionState = !1, 
        this.reconnectionAttempted = 0;
        for (var t in this.socket.channels) this.socket.channels[t] && this.socket.channels[t].subscribe();
    }, t.prototype.reconnect = function() {
        var t = this;
        this.inReconnectionState || (this.inReconnectionState = !0, this.interval = setInterval(function() {
            t.socket.getState() === t.socket.websocket.CLOSED && (t.reconnectionAttempted++, 
            0 !== t.socket.options.reconnectionAttempts && t.reconnectionAttempted >= t.socket.options.reconnectionAttempts && (clearInterval(t.interval), 
            t.autoReconnect = !1, t.inReconnectionState = !1), clearTimeout(t.timer), t.timer = setTimeout(function() {
                return t.socket.create();
            }, Math.floor(Math.random() * (t.socket.options.reconnectionIntervalMax - t.socket.options.reconnectionIntervalMin + 1))));
        }, this.socket.options.reconnectionIntervalMin));
    }, t;
}(), ClusterWS = function() {
    function t(t) {
        return this.channels = {}, this.events = new EventEmitter(), this.missedPing = 0, 
        this.useBinary = !1, t.url ? (this.options = {
            url: t.url,
            autoReconnect: t.autoReconnect || !1,
            reconnectionAttempts: t.reconnectionAttempts || 0,
            reconnectionIntervalMin: t.reconnectionIntervalMin || 1e3,
            reconnectionIntervalMax: t.reconnectionIntervalMax || 5e3
        }, this.options.reconnectionIntervalMin > this.options.reconnectionIntervalMax ? logError("reconnectionIntervalMin can not be more then reconnectionIntervalMax") : (this.reconnection = new Reconnection(this), 
        void this.create())) : logError("Url must be provided and it must be string");
    }
    return t.prototype.create = function() {
        var e = this, n = window.MozWebSocket || window.WebSocket;
        this.websocket = new n(this.options.url), this.websocket.binaryType = "arraybuffer", 
        this.websocket.onopen = function() {
            return e.reconnection.isConnected();
        }, this.websocket.onerror = function(t) {
            return e.events.emit("error", t.message);
        }, this.websocket.onmessage = function(n) {
            var o = "string" != typeof n.data ? String.fromCharCode.apply(null, new Uint8Array(n.data)) : n.data;
            if ("#0" === o) return e.missedPing = 0, e.send("#1", null, "ping");
            try {
                o = JSON.parse(o);
            } catch (t) {
                return logError(t);
            }
            t.decode(e, o);
        }, this.websocket.onclose = function(t) {
            if (e.missedPing = 0, clearInterval(e.pingInterval), e.events.emit("disconnect", t.code, t.reason), 
            e.options.autoReconnect && 1e3 !== t.code) return e.reconnection.reconnect();
            e.events.removeAllEvents();
            for (var n in e) e[n] && (e[n] = null);
        };
    }, t.prototype.on = function(t, e) {
        this.events.on(t, e);
    }, t.prototype.send = function(e, n, o) {
        void 0 === o && (o = "emit"), this.websocket.send(this.useBinary ? t.buffer(t.encode(e, n, o)) : t.encode(e, n, o));
    }, t.prototype.disconnect = function(t, e) {
        this.websocket.close(t || 1e3, e);
    }, t.prototype.getState = function() {
        return this.websocket.readyState;
    }, t.prototype.subscribe = function(t) {
        return this.channels[t] ? this.channels[t] : this.channels[t] = new Channel(this, t);
    }, t.prototype.getChannelByName = function(t) {
        return this.channels[t];
    }, t.buffer = function(t) {
        for (var e = t.length, n = new Uint8Array(e), o = 0; o < e; o++) n[o] = t.charCodeAt(o);
        return n.buffer;
    }, t.decode = function(t, e) {
        switch (e["#"][0]) {
          case "e":
            return t.events.emit(e["#"][1], e["#"][2]);

          case "p":
            t.channels[e["#"][1]] && t.channels[e["#"][1]].onMessage(e["#"][2]);

          case "s":
            switch (e["#"][1]) {
              case "c":
                t.pingInterval = setInterval(function() {
                    return t.missedPing++ > 2 && t.disconnect(4001, "Did not get pings");
                }, e["#"][2].ping), t.useBinary = e["#"][2].binary, t.events.emit("connect");
            }
        }
    }, t.encode = function(t, e, n) {
        switch (n) {
          case "ping":
            return t;

          case "emit":
            return JSON.stringify({
                "#": [ "e", t, e ]
            });

          case "publish":
            return JSON.stringify({
                "#": [ "p", t, e ]
            });

          case "system":
            switch (t) {
              case "subscribe":
                return JSON.stringify({
                    "#": [ "s", "s", e ]
                });

              case "unsubscribe":
                return JSON.stringify({
                    "#": [ "s", "u", e ]
                });

              case "configuration":
                return JSON.stringify({
                    "#": [ "s", "c", e ]
                });
            }
        }
    }, t;
}();

module.exports = ClusterWS;
