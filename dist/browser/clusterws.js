var ClusterWS = function() {
    "use strict";
    function t(t) {
        return console.log(t);
    }
    var n = function() {
        function n(t, n) {
            this.name = n, this.socket = t, this.subscribe();
        }
        return n.prototype.watch = function(n) {
            return "[object Function]" !== {}.toString.call(n) ? t("Listener must be a function") : (this.listener = n, 
            this);
        }, n.prototype.publish = function(t) {
            return this.socket.send(this.name, t, "publish"), this;
        }, n.prototype.unsubscribe = function() {
            this.socket.send("unsubscribe", this.name, "system"), this.socket.channels[this.name] = null;
        }, n.prototype.onMessage = function(t) {
            this.listener && this.listener.call(null, t);
        }, n.prototype.subscribe = function() {
            this.socket.send("subscribe", this.name, "system");
        }, n;
    }(), e = function() {
        function n() {
            this.events = {};
        }
        return n.prototype.on = function(n, e) {
            if ("[object Function]" !== {}.toString.call(e)) return t("Listener must be a function");
            this.events[n] = e;
        }, n.prototype.emit = function(t) {
            for (var n, e = [], o = 1; o < arguments.length; o++) e[o - 1] = arguments[o];
            this.events[t] && (n = this.events[t]).call.apply(n, [ null ].concat(e));
        }, n.prototype.removeAllEvents = function() {
            this.events = {};
        }, n;
    }();
    function o(t, n, e) {
        var o = {
            emit: {
                "#": [ "e", t, n ]
            },
            publish: {
                "#": [ "p", t, n ]
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
        return "ping" === e ? t : JSON.stringify("system" === e ? o[e][t] : o[e]);
    }
    return function() {
        function s(n) {
            return this.events = new e(), this.channels = {}, this.useBinary = !1, this.missedPing = 0, 
            this.reconnectionAttempted = 0, n.url ? (this.options = {
                url: n.url,
                autoReconnect: n.autoReconnect || !1,
                autoReconnectOptions: n.autoReconnectOptions ? {
                    attempts: n.autoReconnectOptions.attempts || 0,
                    minInterval: n.autoReconnectOptions.minInterval || 1e3,
                    maxInterval: n.autoReconnectOptions.maxInterval || 5e3
                } : {
                    attempts: 0,
                    minInterval: 1e3,
                    maxInterval: 5e3
                }
            }, this.options.autoReconnectOptions.minInterval > this.options.autoReconnectOptions.maxInterval ? t("minInterval option can not be more than maxInterval option") : void this.create()) : t("Url must be provided and it must be string");
        }
        return s.prototype.on = function(t, n) {
            this.events.on(t, n);
        }, s.prototype.send = function(t, n, e) {
            void 0 === e && (e = "emit"), this.websocket.send(this.useBinary ? function(t) {
                for (var n = t.length, e = new Uint8Array(n), o = 0; o < n; o++) e[o] = t.charCodeAt(o);
                return e.buffer;
            }(o(t, n, e)) : o(t, n, e));
        }, s.prototype.disconnect = function(t, n) {
            this.websocket.close(t || 1e3, n);
        }, s.prototype.subscribe = function(t) {
            return this.channels[t] ? this.channels[t] : this.channels[t] = new n(this, t);
        }, s.prototype.getChannelByName = function(t) {
            return this.channels[t];
        }, s.prototype.getState = function() {
            return this.websocket.readyState;
        }, s.prototype.create = function() {
            var n = this, e = window.MozWebSocket || window.WebSocket;
            this.websocket = new e(this.options.url), this.websocket.binaryType = "arraybuffer", 
            this.websocket.onopen = function() {
                n.reconnectionAttempted = 0;
                for (var t = 0, e = Object.keys(n.channels), o = e.length; t < o; t++) n.channels[e[t]] && n.channels[e[t]].subscribe();
            }, this.websocket.onerror = function(t) {
                return n.events.emit("error", t);
            }, this.websocket.onmessage = function(e) {
                var o = "string" != typeof e.data ? String.fromCharCode.apply(null, new Uint8Array(e.data)) : e.data;
                if ("#0" === o) return n.missedPing = 0, n.send("#1", null, "ping");
                try {
                    o = JSON.parse(o);
                } catch (n) {
                    return t(n);
                }
                !function(t, n) {
                    var e = {
                        e: function() {
                            return t.events.emit(n["#"][1], n["#"][2]);
                        },
                        p: function() {
                            return t.channels[n["#"][1]] && t.channels[n["#"][1]].onMessage(n["#"][2]);
                        },
                        s: {
                            c: function() {
                                t.pingInterval = setInterval(function() {
                                    return t.missedPing++ > 2 && t.disconnect(4001, "Did not get pings");
                                }, n["#"][2].ping), t.useBinary = n["#"][2].binary, t.events.emit("connect");
                            }
                        }
                    };
                    "s" === n["#"][0] ? e[n["#"][0]][n["#"][1]] && e[n["#"][0]][n["#"][1]].call(null) : e[n["#"][0]] && e[n["#"][0]].call(null);
                }(n, o);
            }, this.websocket.onclose = function(t) {
                if (n.missedPing = 0, clearInterval(n.pingInterval), n.events.emit("disconnect", t.code, t.reason), 
                n.options.autoReconnect && 1e3 !== t.code && (0 === n.options.autoReconnectOptions.attempts || n.reconnectionAttempted < n.options.autoReconnectOptions.attempts)) n.websocket.readyState === n.websocket.CLOSED ? (n.reconnectionAttempted++, 
                n.websocket = void 0, setTimeout(function() {
                    return n.create();
                }, Math.floor(Math.random() * (n.options.autoReconnectOptions.maxInterval - n.options.autoReconnectOptions.minInterval + 1)))) : console.log("Some thing wrong with close event please contact developer"); else {
                    n.events.removeAllEvents();
                    for (var e = 0, o = Object.keys(n), s = o.length; e < s; e++) n[o[e]] = null;
                }
            };
        }, s;
    }();
}();
