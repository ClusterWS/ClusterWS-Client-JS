!function(e, t) {
    if ("object" == typeof exports && "object" == typeof module) module.exports = t(); else if ("function" == typeof define && define.amd) define([], t); else {
        var n = t();
        for (var o in n) ("object" == typeof exports ? exports : e)[o] = n[o];
    }
}(this, function() {
    return function(e) {
        function t(o) {
            if (n[o]) return n[o].exports;
            var s = n[o] = {
                i: o,
                l: !1,
                exports: {}
            };
            return e[o].call(s.exports, s, s.exports, t), s.l = !0, s.exports;
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
        }, t.p = "", t(t.s = 0);
    }([ function(e, t, n) {
        "use strict";
        Object.defineProperty(t, "__esModule", {
            value: !0
        });
        var o = n(1), s = n(2), i = n(3), r = n(4), c = n(5), u = function() {
            function e(e) {
                return e.url ? e.port ? (this.options = {
                    url: e.url,
                    port: e.port,
                    autoReconnect: e.autoReconnect || !1,
                    reconnectionIntervalMin: e.reconnectionIntervalMin || 1e3,
                    reconnectionIntervalMax: e.reconnectionIntervalMax || 5e3,
                    reconnectionAttempts: e.reconnectionAttempts || 0
                }, this.options.reconnectionIntervalMin > this.options.reconnectionIntervalMax ? void o.logError("Min reconnection interval can not be more then Max reconnection interval") : (this.lost = 0, 
                this.events = new s.EventEmitter(), this.channels = {}, this.reconnection = new c.Reconnect(this), 
                void this.create())) : void o.logError("Port must be provided") : void o.logError("Url must be provided");
            }
            return e.prototype.create = function() {
                var e = this;
                this.websocket = new WebSocket("ws://" + this.options.url + ":" + this.options.port), 
                this.websocket.onopen = function() {
                    e.reconnection.isConnected(), e.events.emit("connect");
                }, this.websocket.onmessage = function(t) {
                    if ("#0" === t.data) return e.send("#1", null, "ping"), e.lost = 0;
                    try {
                        t = JSON.parse(t.data);
                    } catch (e) {
                        return o.logError(e);
                    }
                    i.socketDecodeMessages(e, t);
                }, this.websocket.onclose = function(t) {
                    if (e.lost = 0, clearInterval(e.pingInterval), e.events.emit("disconnect", t.code, t.reason), 
                    !e.reconnection.inReconnectionState) {
                        if (e.options.autoReconnect && 1e3 !== t.code) return e.reconnection.reconnect();
                        e.events.removeAllEvents();
                        for (var n in e) e.hasOwnProperty(n) && delete e[n];
                    }
                }, this.websocket.onerror = function() {
                    return e.events.emit("error");
                };
            }, e.prototype.on = function(e, t) {
                this.events.on(e, t);
            }, e.prototype.send = function(e, t, n) {
                this.websocket.send(i.socketEncodeMessages(e, t, n || "emit"));
            }, e.prototype.disconnect = function(e, t) {
                this.websocket.close(e || 1e3, t);
            }, e.prototype.subscribe = function(e) {
                return this.channels[e] ? this.channels[e] : this.channels[e] = new r.Channel(e, this);
            }, e.prototype.getState = function() {
                return this.websocket.readyState;
            }, e;
        }();
        t.ClusterWS = u;
    }, function(e, t, n) {
        "use strict";
        function o(e) {
            console.log(e);
        }
        Object.defineProperty(t, "__esModule", {
            value: !0
        }), t.logError = o;
    }, function(e, t, n) {
        "use strict";
        Object.defineProperty(t, "__esModule", {
            value: !0
        });
        var o = function() {
            function e() {
                this.events = {};
            }
            return e.prototype.on = function(e, t) {
                this.events[e] || (this.events[e] = t);
            }, e.prototype.emit = function(e) {
                for (var t = [], n = 1; n < arguments.length; n++) t[n - 1] = arguments[n];
                this.events[e] && (o = this.events[e]).call.apply(o, [ null ].concat(t));
                var o;
            }, e.prototype.removeAllEvents = function() {
                this.events = {};
            }, e;
        }();
        t.EventEmitter = o;
    }, function(e, t, n) {
        "use strict";
        function o(e, t, n) {
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
        }
        function s(e, t) {
            switch (t["#"][0]) {
              case "e":
                return e.events.emit(t["#"][1], t["#"][2]);

              case "p":
                return e.channels[t["#"][1]] ? e.channels[t["#"][1]].onMessage(t["#"][2]) : "";

              case "s":
                switch (t["#"][1]) {
                  case "c":
                    e.pingInterval = setInterval(function() {
                        return e.lost < 3 ? e.lost++ : e.disconnect(4001, "Did not get pings");
                    }, t["#"][2].ping);
                }
            }
        }
        Object.defineProperty(t, "__esModule", {
            value: !0
        }), t.socketEncodeMessages = o, t.socketDecodeMessages = s;
    }, function(e, t, n) {
        "use strict";
        Object.defineProperty(t, "__esModule", {
            value: !0
        });
        var o = function() {
            function e(e, t) {
                this.channel = e, this.socket = t, this.subscribe();
            }
            return e.prototype.watch = function(e) {
                return this.listener = e, this;
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
        t.Channel = o;
    }, function(e, t, n) {
        "use strict";
        Object.defineProperty(t, "__esModule", {
            value: !0
        });
        var o = function() {
            function e(e) {
                this.socket = e, this.autoReconnect = this.socket.options.autoReconnect, this.inReconnectionState = !1, 
                this.reconnectionAttempted = 0;
            }
            return e.prototype.isConnected = function() {
                clearTimeout(this.timer), clearInterval(this.interval), this.inReconnectionState = !1, 
                this.reconnectionAttempted = 0;
                var e = this.socket.channels;
                for (var t in e) e.hasOwnProperty(t) && e[t].subscribe();
            }, e.prototype.reconnect = function() {
                var e = this;
                this.inReconnectionState = !0, this.interval = setInterval(function() {
                    e.socket.websocket.readyState === e.socket.websocket.CLOSED && (e.reconnectionAttempted++, 
                    0 !== e.socket.options.reconnectionAttempts && e.reconnectionAttempted >= e.socket.options.reconnectionAttempts && (clearInterval(e.interval), 
                    e.autoReconnect = !1, e.inReconnectionState = !1), clearTimeout(e.timer), e.timer = setTimeout(function() {
                        e.socket.create();
                    }, Math.floor(Math.random() * (e.socket.options.reconnectionIntervalMax - e.socket.options.reconnectionIntervalMin + 1))));
                }, this.socket.options.reconnectionIntervalMin);
            }, e;
        }();
        t.Reconnect = o;
    } ]);
});