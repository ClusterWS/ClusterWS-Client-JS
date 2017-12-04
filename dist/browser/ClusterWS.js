!function(e, t) {
    if ("object" == typeof exports && "object" == typeof module) module.exports = t(); else if ("function" == typeof define && define.amd) define([], t); else {
        var n = t();
        for (var o in n) ("object" == typeof exports ? exports : e)[o] = n[o];
    }
}("undefined" != typeof self ? self : this, function() {
    return function(e) {
        function t(o) {
            if (n[o]) return n[o].exports;
            var r = n[o] = {
                i: o,
                l: !1,
                exports: {}
            };
            return e[o].call(r.exports, r, r.exports, t), r.l = !0, r.exports;
        }
        var n = {};
        return t.m = e, t.c = n, t.d = function(e, n, o) {
            t.o(e, n) || Object.defineProperty(e, n, {
                configurable: !1,
                enumerable: !0,
                get: o
            });
        }, t.n = function(e) {
            var n = e && e.__esModule ? function() {
                return e.default;
            } : function() {
                return e;
            };
            return t.d(n, "a", n), n;
        }, t.o = function(e, t) {
            return Object.prototype.hasOwnProperty.call(e, t);
        }, t.p = "", t(t.s = 1);
    }([ function(e, t, n) {
        "use strict";
        function o(e) {
            return console.log(e);
        }
        Object.defineProperty(t, "__esModule", {
            value: !0
        }), t.logError = o;
    }, function(e, t, n) {
        "use strict";
        Object.defineProperty(t, "__esModule", {
            value: !0
        });
        var o = n(2), r = n(3), i = n(4), s = n(0), c = function() {
            function e(e) {
                return this.channels = {}, this.missedPing = 0, this.events = new r.EventEmitter(), 
                this.useBinary = !1, e.url && "string" == typeof e.url ? e.port && "number" == typeof e.port ? (this.options = {
                    url: e.url,
                    port: e.port,
                    autoReconnect: e.autoReconnect || !1,
                    reconnectionIntervalMin: e.reconnectionIntervalMin || 1e3,
                    reconnectionIntervalMax: e.reconnectionIntervalMax || 5e3,
                    reconnectionAttempts: e.reconnectionAttempts || 0,
                    secure: e.secure || !1
                }, this.options.reconnectionIntervalMin > this.options.reconnectionIntervalMax ? s.logError("reconnectionIntervalMin can not be more then reconnectionIntervalMax") : (this.reconnection = new i.Reconnection(this), 
                void this.create())) : s.logError("Port must be provided and it must be number") : s.logError("Url must be provided and it must be string");
            }
            return e.buffer = function(e) {
                for (var t = e.length, n = new Uint8Array(t), o = 0; o < t; o++) n[o] = e.charCodeAt(o);
                return n.buffer;
            }, e.decode = function(e, t) {
                switch (t["#"][0]) {
                  case "e":
                    return e.events.emit(t["#"][1], t["#"][2]);

                  case "p":
                    return e.channels[t["#"][1]] ? e.channels[t["#"][1]].onMessage(t["#"][2]) : "";

                  case "s":
                    switch (t["#"][1]) {
                      case "c":
                        e.pingInterval = setInterval(function() {
                            return e.missedPing++ > 2 ? e.disconnect(4001, "Did not get pings") : "";
                        }, t["#"][2].ping), e.useBinary = t["#"][2].binary, e.events.emit("connect");
                    }
                }
            }, e.encode = function(e, t, n) {
                switch (n) {
                  case "ping":
                    return e;

                  case "emit":
                    return JSON.stringify({
                        "#": [ "e", e, t ]
                    });

                  case "publish":
                    return JSON.stringify({
                        "#": [ "p", e, t ]
                    });

                  case "system":
                    switch (e) {
                      case "subscribe":
                        return JSON.stringify({
                            "#": [ "s", "s", t ]
                        });

                      case "unsubscribe":
                        return JSON.stringify({
                            "#": [ "s", "u", t ]
                        });

                      case "configuration":
                        return JSON.stringify({
                            "#": [ "s", "c", t ]
                        });
                    }
                }
            }, e.prototype.create = function() {
                var t = this, n = this.options.secure ? "wss://" : "ws://";
                this.websocket = new WebSocket(n + this.options.url + ":" + this.options.port), 
                this.websocket.binaryType = "arraybuffer", this.websocket.onopen = function() {
                    return t.reconnection.isConnected();
                }, this.websocket.onerror = function(e) {
                    return t.events.emit("error", e.message);
                }, this.websocket.onmessage = function(n) {
                    t.useBinary && "string" != typeof n.data && (n = String.fromCharCode.apply(null, new Uint8Array(n.data))), 
                    "#0" === n && (t.missedPing = 0, t.send("#1", null, "ping"));
                    try {
                        n = JSON.parse(n);
                    } catch (e) {
                        return s.logError(e);
                    }
                    e.decode(t, n);
                }, this.websocket.onclose = function(e) {
                    if (t.missedPing = 0, clearInterval(t.pingInterval), t.events.emit("disconnect", e.code, e.reason), 
                    !t.reconnection.inReconnectionState) {
                        if (t.options.autoReconnect && 1e3 !== e.code) return t.reconnection.reconnect();
                        t.events.removeAllEvents();
                        for (var n in t) t.hasOwnProperty(n) && delete t[n];
                    }
                };
            }, e.prototype.on = function(e, t) {
                this.events.on(e, t);
            }, e.prototype.send = function(t, n, o) {
                void 0 === o && (o = "emit"), this.websocket.send(this.useBinary ? e.buffer(e.encode(t, n, o)) : e.encode(t, n, o));
            }, e.prototype.disconnect = function(e, t) {
                this.websocket.close(e || 1e3, t);
            }, e.prototype.getState = function() {
                return this.websocket.readyState;
            }, e.prototype.subscribe = function(e) {
                return this.channels[e] ? this.channels[e] : this.channels[e] = new o.Channel(this, e);
            }, e.prototype.getChannelByName = function(e) {
                return this.channels[e];
            }, e;
        }();
        t.ClusterWS = c;
    }, function(e, t, n) {
        "use strict";
        Object.defineProperty(t, "__esModule", {
            value: !0
        });
        var o = n(0), r = function() {
            function e(e, t) {
                this.socket = e, this.channel = t, this.subscribe();
            }
            return e.prototype.watch = function(e) {
                return "[object Function]" !== {}.toString.call(e) ? o.logError("Listener must be a function") : (this.listener = e, 
                this);
            }, e.prototype.publish = function(e) {
                return this.socket.send(this.channel, e, "publish"), this;
            }, e.prototype.unsubscribe = function() {
                this.socket.send("unsubscribe", this.channel, "system"), this.socket.channels[this.channel] = null;
            }, e.prototype.onMessage = function(e) {
                this.listener && this.listener.call(null, e);
            }, e.prototype.subscribe = function() {
                this.socket.send("subscribe", this.channel, "system");
            }, e;
        }();
        t.Channel = r;
    }, function(e, t, n) {
        "use strict";
        Object.defineProperty(t, "__esModule", {
            value: !0
        });
        var o = n(0), r = function() {
            function e() {
                this.events = {};
            }
            return e.prototype.on = function(e, t) {
                if ("[object Function]" !== {}.toString.call(t)) return o.logError("Listener must be a function");
                this.events[e] || (this.events[e] = t);
            }, e.prototype.emit = function(e) {
                for (var t = [], n = 1; n < arguments.length; n++) t[n - 1] = arguments[n];
                this.events[e] && (o = this.events[e]).call.apply(o, [ null ].concat(t));
                var o;
            }, e.prototype.removeAllEvents = function() {
                this.events = {};
            }, e;
        }();
        t.EventEmitter = r;
    }, function(e, t, n) {
        "use strict";
        Object.defineProperty(t, "__esModule", {
            value: !0
        });
        var o = function() {
            function e(e) {
                this.socket = e, this.inReconnectionState = !1, this.reconnectionAttempted = 0, 
                this.autoReconnect = this.socket.options.autoReconnect;
            }
            return e.prototype.isConnected = function() {
                clearTimeout(this.timer), clearInterval(this.interval), this.inReconnectionState = !1, 
                this.reconnectionAttempted = 0;
                for (var e in this.socket.channels) this.socket.channels.hasOwnProperty(e) && this.socket.channels[e].subscribe();
            }, e.prototype.reconnect = function() {
                var e = this;
                this.inReconnectionState = !0, this.interval = setInterval(function() {
                    e.socket.getState() === e.socket.websocket.CLOSED && (e.reconnectionAttempted++, 
                    0 !== e.socket.options.reconnectionAttempts && e.reconnectionAttempted >= e.socket.options.reconnectionAttempts && (clearInterval(e.interval), 
                    e.autoReconnect = !1, e.inReconnectionState = !1), clearTimeout(e.timer), e.timer = setTimeout(function() {
                        return e.socket.create();
                    }, Math.floor(Math.random() * (e.socket.options.reconnectionIntervalMax - e.socket.options.reconnectionIntervalMin + 1))));
                }, this.socket.options.reconnectionIntervalMin);
            }, e;
        }();
        t.Reconnection = o;
    } ]);
});