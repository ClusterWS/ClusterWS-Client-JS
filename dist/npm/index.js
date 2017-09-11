!function(t, e) {
    if ("object" == typeof exports && "object" == typeof module) module.exports = e(); else if ("function" == typeof define && define.amd) define([], e); else {
        var n = e();
        for (var o in n) ("object" == typeof exports ? exports : t)[o] = n[o];
    }
}(this, function() {
    return function(t) {
        function e(o) {
            if (n[o]) return n[o].exports;
            var r = n[o] = {
                i: o,
                l: !1,
                exports: {}
            };
            return t[o].call(r.exports, r, r.exports, e), r.l = !0, r.exports;
        }
        var n = {};
        return e.m = t, e.c = n, e.d = function(t, n, o) {
            e.o(t, n) || Object.defineProperty(t, n, {
                configurable: !1,
                enumerable: !0,
                get: o
            });
        }, e.n = function(t) {
            var n = t && t.__esModule ? function() {
                return t.default;
            } : function() {
                return t;
            };
            return e.d(n, "a", n), n;
        }, e.o = function(t, e) {
            return Object.prototype.hasOwnProperty.call(t, e);
        }, e.p = "", e(e.s = 2);
    }([ function(t, e, n) {
        "use strict";
        Object.defineProperty(e, "__esModule", {
            value: !0
        });
        var o = function(t) {
            return function e() {
                for (var n = [], o = 0; o < arguments.length; o++) n[o] = arguments[o];
                return n.length < t.length ? function() {
                    for (var t = [], o = 0; o < arguments.length; o++) t[o] = arguments[o];
                    return e.call.apply(e, [ null ].concat(n, t));
                } : t.length ? t.call.apply(t, [ null ].concat(n)) : t;
            };
        }, r = function(t) {
            return t ? "function" == typeof t ? t() : t : "";
        }, i = o(function(t, e) {
            return r(e in t ? t[e] : t.default);
        }), c = function(t, e) {
            for (var n = -1, o = null == e ? 0 : e.length, r = new Array(o); ++n < o; ) r[n] = t(e[n], n, e);
            return r;
        }, s = function(t, e) {
            var n = {};
            return e = Object(e), Object.keys(e).forEach(function(o) {
                return n[o] = t(e[o], o, e);
            }), n;
        }, u = o(function(t, e) {
            return e instanceof Array ? c(t, e) : s(t, e);
        });
        e._ = {
            map: u,
            curry: o,
            switchcase: i
        };
    }, function(t, e, n) {
        "use strict";
        Object.defineProperty(e, "__esModule", {
            value: !0
        }), e.logError = function(t) {
            return console.log("Error: ", t);
        };
    }, function(t, e, n) {
        "use strict";
        var o = this && this.__extends || function() {
            var t = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function(t, e) {
                t.__proto__ = e;
            } || function(t, e) {
                for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
            };
            return function(e, n) {
                function o() {
                    this.constructor = e;
                }
                t(e, n), e.prototype = null === n ? Object.create(n) : (o.prototype = n.prototype, 
                new o());
            };
        }();
        Object.defineProperty(e, "__esModule", {
            value: !0
        });
        var r = n(3), i = n(7), c = function(t) {
            function e(e) {
                return t.call(this, new i.Options(e || {})) || this;
            }
            return o(e, t), e;
        }(r.Socket);
        e.ClusterWS = c;
    }, function(t, e, n) {
        "use strict";
        Object.defineProperty(e, "__esModule", {
            value: !0
        });
        var o = n(0), r = n(4), i = n(5), c = n(6), s = function() {
            function t(t) {
                this.options = t, this.events = new i.EventEmitter(), this.channels = {}, this.autoReconnect = !1, 
                this.inReconnectionState = !1, this.reconnectionAttempted = 0, this.autoReconnect = this.options.autoReconnect, 
                this.connect();
            }
            return t.prototype.connect = function(t) {
                var e, n = this, r = 0;
                this.webSocket = new WebSocket("ws://" + this.options.url + ":" + this.options.port), 
                this.webSocket.onerror = function(t) {
                    return n.events.emit("error", t);
                }, this.webSocket.onopen = function() {
                    clearInterval(t), n.inReconnectionState = !1, n.reconnectionAttempted = 0, o._.map(function(t) {
                        return t.subscribe();
                    }, n.channels), n.events.emit("connect");
                }, this.webSocket.onmessage = function(t) {
                    if ("#0" === t.data) return r = 0, n.send("#1", null, "ping");
                    t = JSON.parse(t.data), o._.switchcase({
                        p: function() {
                            return n.channels[t.m[1]] ? n.channels[t.m[1]].message(t.m[2]) : "";
                        },
                        e: function() {
                            return n.events.emit(t.m[1], t.m[2]);
                        },
                        s: function() {
                            return o._.switchcase({
                                c: function() {
                                    return e = setInterval(function() {
                                        return r < 3 ? r++ : n.webSocket.disconnect(3001, "No pings from server");
                                    }, t.m[2].ping);
                                }
                            })(t.m[1]);
                        }
                    })(t.m[0]);
                }, this.webSocket.onclose = function(t) {
                    if (clearInterval(e), n.events.emit("disconnect", t.code, t.reason), n.autoReconnect && 1e3 !== t.code) return n.inReconnectionState ? "" : n.reconnection();
                    n.events.removeAllEvents();
                    for (var o in n) n.hasOwnProperty(o) && (n[o] = null, delete n[o]);
                };
            }, t.prototype.subscribe = function(t) {
                return this.channels[t] ? this.channels[t] : this.channels[t] = new r.Channel(t, this);
            }, t.prototype.disconnect = function(t, e) {
                this.webSocket.close(t || 1e3, e);
            }, t.prototype.on = function(t, e) {
                this.events.on(t, e);
            }, t.prototype.send = function(t, e, n) {
                this.webSocket.send(c.socketMessages(t, e, n || "emit"));
            }, t.prototype.getState = function() {
                return this.webSocket.readyState;
            }, t.prototype.reconnection = function() {
                var t = this;
                this.inReconnectionState = !0;
                var e = setInterval(function() {
                    t.webSocket.readyState === t.webSocket.CLOSED && (t.reconnectionAttempted++, 0 !== t.options.reconnectionAttempts && t.reconnectionAttempted >= t.options.reconnectionAttempts && (clearInterval(e), 
                    t.autoReconnect = !1, t.inReconnectionState = !1), t.connect(e));
                }, this.options.reconnectionInterval);
            }, t;
        }();
        e.Socket = s;
    }, function(t, e, n) {
        "use strict";
        Object.defineProperty(e, "__esModule", {
            value: !0
        });
        var o = function() {
            function t(t, e) {
                this.channel = t, this.socket = e, this.subscribe();
            }
            return t.prototype.watch = function(t) {
                return this.event = t, this;
            }, t.prototype.publish = function(t) {
                return this.channel && this.socket.send(this.channel, t, "publish"), this;
            }, t.prototype.message = function(t) {
                this.event && this.event(t);
            }, t.prototype.unsubscribe = function() {
                this.socket.send("unsubscribe", this.channel, "system"), this.socket.channels[this.channel] = null;
                for (var t in this) this.hasOwnProperty(t) && (this[t] = null, delete this[t]);
            }, t.prototype.subscribe = function() {
                this.socket.send("subscribe", this.channel, "system");
            }, t;
        }();
        e.Channel = o;
    }, function(t, e, n) {
        "use strict";
        Object.defineProperty(e, "__esModule", {
            value: !0
        });
        var o = n(0), r = n(1), i = function() {
            function t() {
                this._events = {};
            }
            return t.prototype.on = function(t, e) {
                e && "function" == typeof e || r.logError("Listener must be a function"), this._events[t] ? this._events[t].push(e) : this._events[t] = [ e ];
            }, t.prototype.emit = function(t) {
                for (var e = [], n = 1; n < arguments.length; n++) e[n - 1] = arguments[n];
                o._.map(function(t) {
                    return t.call.apply(t, [ null ].concat(e));
                }, this._events[t]);
            }, t.prototype.removeAllEvents = function() {
                this._events = {};
            }, t;
        }();
        e.EventEmitter = i;
    }, function(t, e, n) {
        "use strict";
        function o(t, e, n) {
            return r._.switchcase({
                publish: JSON.stringify({
                    m: [ "p", t, e ]
                }),
                emit: JSON.stringify({
                    m: [ "e", t, e ]
                }),
                system: r._.switchcase({
                    subscribe: JSON.stringify({
                        m: [ "s", "s", e ]
                    }),
                    unsubscribe: JSON.stringify({
                        m: [ "s", "u", e ]
                    })
                })(t),
                ping: t
            })(n);
        }
        Object.defineProperty(e, "__esModule", {
            value: !0
        });
        var r = n(0);
        e.socketMessages = o;
    }, function(t, e, n) {
        "use strict";
        Object.defineProperty(e, "__esModule", {
            value: !0
        });
        var o = n(1), r = function() {
            function t(t) {
                if (!t.url) throw o.logError("Url must be provided");
                if (!t.port) throw o.logError("Port must be provided");
                this.url = t.url, this.port = t.port, this.autoReconnect = t.autoReconnect || !1, 
                this.reconnectionInterval = t.reconnectionInterval || 1e3, this.reconnectionAttempts = t.reconnectionAttempts || 0;
            }
            return t;
        }();
        e.Options = r;
    } ]);
});