"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var channel_1 = require("./lib/channel/channel");
var messages_1 = require("./lib/messages/messages");
var Options = (function () {
    function Options(url, port) {
        if (!url) {
            throw new Error('Url must be provided');
        }
        if (!port) {
            throw new Error('Port must be provided');
        }
        this.url = url;
        this.port = port;
    }
    return Options;
}());
var ClusterWS = (function () {
    function ClusterWS(configurations) {
        var _this = this;
        this.configurations = configurations;
        this.events = {};
        this.channels = {};
        configurations = configurations || {};
        this.options = new Options(configurations.url, configurations.port);
        this.webSocket = new WebSocket('ws://' + this.options.url + ':' + this.options.port);
        this.webSocket.onopen = function (msg) {
            _this._execEvent('connect', msg);
        };
        this.webSocket.onclose = function (msg) {
            _this._execEvent('disconnect', msg);
            for (var key in _this.channels) {
                if (_this.channels.hasOwnProperty(key)) {
                    _this.channels[key] = null;
                    delete _this.channels[key];
                }
            }
            for (var key in _this.events) {
                if (_this.events.hasOwnProperty(key)) {
                    _this.events[key] = null;
                    delete _this.events[key];
                }
            }
            for (var key in _this) {
                if (_this.hasOwnProperty(key)) {
                    _this[key] = null;
                    delete _this[key];
                }
            }
        };
        this.webSocket.onerror = function (msg) {
            _this._execEvent('error', msg);
        };
        this.webSocket.onmessage = function (msg) {
            msg = JSON.parse(msg.data);
            if (msg.action === 'emit') {
                _this._execEvent(msg.event, msg.data);
            }
            if (msg.action === 'publish') {
                _this._execChannel(msg.channel, msg.data);
            }
        };
    }
    ClusterWS.prototype._execEvent = function (event, data) {
        var exFn = this.events[event];
        if (exFn)
            exFn(data);
    };
    ClusterWS.prototype._execChannel = function (channel, data) {
        var exFn = this.channels[channel];
        if (exFn)
            exFn(data);
    };
    ClusterWS.prototype.on = function (event, fn) {
        if (this.events[event])
            this.events[event] = null;
        this.events[event] = fn;
    };
    ClusterWS.prototype.send = function (event, data) {
        this.webSocket.send(messages_1.MessageFactory.emitMessage(event, data));
    };
    ClusterWS.prototype.subscribe = function (channel) {
        return new channel_1.Channel(channel, this);
    };
    return ClusterWS;
}());
exports.ClusterWS = ClusterWS;
