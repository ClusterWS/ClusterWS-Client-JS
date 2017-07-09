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
        this.pingPong = 0;
        this.events = {};
        this.channels = {};
        configurations = configurations || {};
        this.options = new Options(configurations.url, configurations.port);
        this.webSocket = new WebSocket('ws://' + this.options.url + ':' + this.options.port);
        this.webSocket.onopen = function (msg) {
            return _this._execEventFn('connect', msg);
        };
        this.webSocket.onclose = function (code, msg) {
            _this._execEventFn('disconnect', code, msg);
            clearInterval(_this.pingTimeOut);
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
            return;
        };
        this.webSocket.onerror = function (msg) {
            return _this._execEventFn('error', msg);
        };
        this.webSocket.onmessage = function (msg) {
            if (msg.data === '_0') {
                _this.pingPong--;
                return _this.webSocket.send('_1');
            }
            msg = JSON.parse(msg.data);
            if (msg.action === 'emit') {
                return _this._execEventFn(msg.event, msg.data);
            }
            if (msg.action === 'publish') {
                return _this._execChannelFn(msg.channel, msg.data);
            }
            if (msg.action === 'internal') {
                if (msg.event === 'config') {
                    _this.pingTimeOut = setInterval(function () {
                        if (_this.pingPong >= 2) {
                            return _this.disconnect(1000, 'Did not get ping');
                        }
                        return _this.pingPong++;
                    }, msg.data.ping);
                    return;
                }
            }
            return;
        };
    }
    ClusterWS.prototype._execEventFn = function (event, data, msg) {
        var exFn = this.events[event];
        if (exFn) {
            if (event === 'disconnect')
                return exFn(data, msg);
            return exFn(data);
        }
        return;
    };
    ClusterWS.prototype._execChannelFn = function (channel, data) {
        var exFn = this.channels[channel];
        if (exFn)
            exFn(data);
        return;
    };
    ClusterWS.prototype.on = function (event, fn) {
        if (this.events[event])
            this.events[event] = null;
        return this.events[event] = fn;
    };
    ClusterWS.prototype.send = function (event, data) {
        return this.webSocket.send(messages_1.MessageFactory.emitMessage(event, data));
    };
    ClusterWS.prototype.disconnect = function (code, message) {
        this.webSocket.close(code, message);
    };
    ClusterWS.prototype.subscribe = function (channel) {
        return new channel_1.Channel(channel, this);
    };
    return ClusterWS;
}());
exports.ClusterWS = ClusterWS;
