var ClusterWS = function() {
    "use strict";
    function t(t) {
        return console.log(t);
    }
    var n = function() {
        function n(t, n) {
            this.socket = t, this.channel = n, this.subscribe();
        }
        return n.prototype.watch = function(n) {
            return "[object Function]" !== {}.toString.call(n) ? t("Listener must be a function") : (this.listener = n, 
            this);
        }, n.prototype.publish = function(t) {
            return this.socket.send(this.channel, t, "publish"), this;
        }, n.prototype.unsubscribe = function() {
            this.socket.send("unsubscribe", this.channel, "system"), this.socket.channels[this.channel] = null;
        }, n.prototype.onMessage = function(t) {
            this.listener && this.listener.call(null, t);
        }, n.prototype.subscribe = function() {
            this.socket.send("subscribe", this.channel, "system");
        }, n;
    }(), e = function() {
        function n() {
            this.events = {};
        }
        return n.prototype.on = function(n, e) {
            if ("[object Function]" !== {}.toString.call(e)) return t("Listener must be a function");
            this.events[n] || (this.events[n] = e);
        }, n.prototype.emit = function(t) {
            for (var n = [], e = 1; e < arguments.length; e++) n[e - 1] = arguments[e];
            this.events[t] && (o = this.events[t]).call.apply(o, [ null ].concat(n));
            var o;
        }, n.prototype.removeAllEvents = function() {
            this.events = {};
        }, n;
    }(), o = function() {
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
            this.inReconnectionState = !0, this.interval = setInterval(function() {
                t.socket.getState() === t.socket.websocket.CLOSED && (t.reconnectionAttempted++, 
                0 !== t.socket.options.reconnectionAttempts && t.reconnectionAttempted >= t.socket.options.reconnectionAttempts && (clearInterval(t.interval), 
                t.autoReconnect = !1, t.inReconnectionState = !1), clearTimeout(t.timer), t.timer = setTimeout(function() {
                    return t.socket.create();
                }, Math.floor(Math.random() * (t.socket.options.reconnectionIntervalMax - t.socket.options.reconnectionIntervalMin + 1))));
            }, this.socket.options.reconnectionIntervalMin);
        }, t;
    }();
    return function() {
        function i(n) {
            return this.channels = {}, this.missedPing = 0, this.events = new e(), this.useBinary = !1, 
            n.url && "string" == typeof n.url ? (this.options = {
                url: n.url,
                autoReconnect: n.autoReconnect || !1,
                reconnectionIntervalMin: n.reconnectionIntervalMin || 1e3,
                reconnectionIntervalMax: n.reconnectionIntervalMax || 5e3,
                reconnectionAttempts: n.reconnectionAttempts || 0
            }, this.options.reconnectionIntervalMin > this.options.reconnectionIntervalMax ? t("reconnectionIntervalMin can not be more then reconnectionIntervalMax") : (this.reconnection = new o(this), 
            void this.create())) : t("Url must be provided and it must be string");
        }
        return i.buffer = function(t) {
            for (var n = t.length, e = new Uint8Array(n), o = 0; o < n; o++) e[o] = t.charCodeAt(o);
            return e.buffer;
        }, i.decode = function(t, n) {
            switch (n["#"][0]) {
              case "e":
                return t.events.emit(n["#"][1], n["#"][2]);

              case "p":
                return t.channels[n["#"][1]] ? t.channels[n["#"][1]].onMessage(n["#"][2]) : null;

              case "s":
                switch (n["#"][1]) {
                  case "c":
                    t.pingInterval = setInterval(function() {
                        return t.missedPing++ > 2 ? t.disconnect(4001, "Did not get pings") : null;
                    }, n["#"][2].ping), t.useBinary = n["#"][2].binary, t.events.emit("connect");
                }
            }
        }, i.encode = function(t, n, e) {
            switch (e) {
              case "ping":
                return t;

              case "emit":
                return JSON.stringify({
                    "#": [ "e", t, n ]
                });

              case "publish":
                return JSON.stringify({
                    "#": [ "p", t, n ]
                });

              case "system":
                switch (t) {
                  case "subscribe":
                    return JSON.stringify({
                        "#": [ "s", "s", n ]
                    });

                  case "unsubscribe":
                    return JSON.stringify({
                        "#": [ "s", "u", n ]
                    });

                  case "configuration":
                    return JSON.stringify({
                        "#": [ "s", "c", n ]
                    });
                }
            }
        }, i.prototype.create = function() {
            var n = this, e = window.MozWebSocket || window.WebSocket;
            this.websocket = new e(this.options.url), this.websocket.binaryType = "arraybuffer", 
            this.websocket.onopen = function() {
                return n.reconnection.isConnected();
            }, this.websocket.onerror = function(t) {
                return n.events.emit("error", t.message);
            }, this.websocket.onmessage = function(e) {
                var o = e.data;
                if ("string" != typeof o && (o = String.fromCharCode.apply(null, new Uint8Array(o))), 
                "#0" === o) return n.missedPing = 0, n.send("#1", null, "ping");
                try {
                    o = JSON.parse(o);
                } catch (n) {
                    return t(n);
                }
                i.decode(n, o);
            }, this.websocket.onclose = function(t) {
                if (n.missedPing = 0, clearInterval(n.pingInterval), n.events.emit("disconnect", t.code, t.reason), 
                !n.reconnection.inReconnectionState) {
                    if (n.options.autoReconnect && 1e3 !== t.code) return n.reconnection.reconnect();
                    n.events.removeAllEvents();
                    for (var e in n) n[e] && (n[e] = null);
                }
            };
        }, i.prototype.on = function(t, n) {
            this.events.on(t, n);
        }, i.prototype.send = function(t, n, e) {
            void 0 === e && (e = "emit"), this.websocket.send(this.useBinary ? i.buffer(i.encode(t, n, e)) : i.encode(t, n, e));
        }, i.prototype.disconnect = function(t, n) {
            this.websocket.close(t || 1e3, n);
        }, i.prototype.getState = function() {
            return this.websocket.readyState;
        }, i.prototype.subscribe = function(t) {
            return this.channels[t] ? this.channels[t] : this.channels[t] = new n(this, t);
        }, i.prototype.getChannelByName = function(t) {
            return this.channels[t];
        }, i;
    }();
}();
