(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var EmitMessage = (function () {
    function EmitMessage(event, data) {
        this.event = event;
        this.data = data;
        this.action = 'emit';
    }
    return EmitMessage;
}());
var PublishMessage = (function () {
    function PublishMessage(channel, data) {
        this.channel = channel;
        this.data = data;
        this.action = 'publish';
    }
    return PublishMessage;
}());
var InternalMessage = (function () {
    function InternalMessage(event, data) {
        this.event = event;
        this.data = data;
        this.action = 'internal';
    }
    return InternalMessage;
}());
var MessageFactory = (function () {
    function MessageFactory() {
    }
    MessageFactory.emitMessage = function (event, data) {
        return JSON.stringify(new EmitMessage(event, data));
    };
    MessageFactory.publishMessage = function (channel, data) {
        return JSON.stringify(new PublishMessage(channel, data));
    };
    MessageFactory.internalMessage = function (event, data) {
        return JSON.stringify(new InternalMessage(event, data));
    };
    return MessageFactory;
}());
exports.MessageFactory = MessageFactory;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var channel_1 = __webpack_require__(2);
var messages_1 = __webpack_require__(0);
var eventEmitter_1 = __webpack_require__(3);
var options_1 = __webpack_require__(4);
var ClusterWS = (function () {
    function ClusterWS(configurations) {
        this.configurations = configurations;
        this.missedPing = 0;
        this.inReconnectState = false;
        this.reconnectAttempts = 1;
        this.configurations = this.configurations || {};
        this.eventEmitter = new eventEmitter_1.EventEmitter();
        this.channelsEmitter = new eventEmitter_1.EventEmitter();
        this.options = new options_1.Options(this.configurations);
        this.autoReconnect = this.options.autoReconnect;
        this._connect();
    }
    ClusterWS.prototype.on = function (event, fn) {
        if (this.eventEmitter.exist(event))
            return;
        this.eventEmitter.on(event, fn);
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
    ClusterWS.prototype._connect = function () {
        this.webSocket = new WebSocket('ws://' + this.options.url + ':' + this.options.port);
        this._listenOnOpen();
        this._listenOnMessage();
        this._listenOnError();
        this._listenOnClose();
    };
    ClusterWS.prototype._listenOnOpen = function () {
        var _this = this;
        this.webSocket.onopen = function (msg) {
            _this.reconnectAttempts = 0;
            _this.inReconnectState = false;
            clearInterval(_this.reconnectInterval);
            _this.eventEmitter.emit('connect', msg);
        };
    };
    ClusterWS.prototype._listenOnMessage = function () {
        var _this = this;
        this.webSocket.onmessage = function (msg) {
            if (msg.data === '_0') {
                _this.missedPing = 0;
                return _this.webSocket.send('_1');
            }
            try {
                msg = JSON.parse(msg.data);
            }
            catch (e) {
                return _this.disconnect(1007);
            }
            switch (msg.action) {
                case 'emit':
                    _this.eventEmitter.emit(msg.event, msg.data);
                    break;
                case 'publish':
                    _this.channelsEmitter.emit(msg.channel, msg.data);
                    break;
                case 'internal':
                    if (msg.event === 'config') {
                        _this.pingTimeOut = setInterval(function () {
                            if (_this.missedPing > 2) {
                                return _this.disconnect(3001, 'Did not get ping');
                            }
                            return _this.missedPing++;
                        }, msg.data.pingInterval);
                    }
                    break;
                default:
                    break;
            }
        };
    };
    ClusterWS.prototype._listenOnClose = function () {
        var _this = this;
        this.webSocket.onclose = function (code, msg) {
            _this.eventEmitter.emit('disconnect', code, msg);
            clearInterval(_this.pingTimeOut);
            _this.eventEmitter.emit('_destroyChannel');
            _this.eventEmitter.removeAllEvents();
            _this.channelsEmitter.removeAllEvents();
            if (!_this.autoReconnect || code === 1000) {
                for (var key in _this) {
                    if (_this.hasOwnProperty(key)) {
                        _this[key] = null;
                        delete _this[key];
                    }
                }
            }
            else if (!_this.inReconnectState) {
                _this._reconnect();
            }
        };
    };
    ClusterWS.prototype._reconnect = function () {
        var _this = this;
        this.inReconnectState = true;
        this.reconnectInterval = setInterval(function () {
            if (_this.webSocket.readyState === _this.webSocket.CLOSED) {
                _this.reconnectAttempts++;
                _this._connect();
            }
            else {
                console.log('Not ready to reconnect');
            }
            if (_this.options.reconnectAttempts !== 0) {
                if (_this.reconnectAttempts >= _this.options.reconnectAttempts) {
                    _this.autoReconnect = false;
                    return clearInterval(_this.reconnectInterval);
                }
            }
        }, this.options.reconnectInterval);
    };
    ClusterWS.prototype._listenOnError = function () {
        var _this = this;
        this.webSocket.onerror = function (msg) {
            _this.eventEmitter.emit('error', msg);
        };
    };
    return ClusterWS;
}());
exports.ClusterWS = ClusterWS;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var messages_1 = __webpack_require__(0);
var Channel = (function () {
    function Channel(channel, client) {
        var _this = this;
        this.channel = channel;
        this.client = client;
        this.client.webSocket.send(messages_1.MessageFactory.internalMessage('subscribe', this.channel));
        this.client.eventEmitter.on('_destroyChannel', function () {
            for (var key in _this) {
                if (_this.hasOwnProperty(key)) {
                    _this[key] = null;
                    delete _this[key];
                }
            }
        });
    }
    Channel.prototype.watch = function (fn) {
        this.client.channelsEmitter.on(this.channel, fn);
        return this;
    };
    Channel.prototype.publish = function (data) {
        this.client.webSocket.send(messages_1.MessageFactory.publishMessage(this.channel, data));
        return this;
    };
    return Channel;
}());
exports.Channel = Channel;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var EventEmitter = (function () {
    function EventEmitter() {
        this._events = {};
    }
    EventEmitter.prototype.on = function (event, listener) {
        if (!listener)
            throw 'Function must be provided';
        if (!this._events[event]) {
            this._events[event] = [];
        }
        return this._events[event].push(listener);
    };
    EventEmitter.prototype.emit = function (event, data, param2, param3) {
        if (this._events[event]) {
            for (var i = 0, len = this._events[event].length; i < len; i++) {
                if (typeof this._events[event][i] === 'function') {
                    this._events[event][i].call(this, data, param2, param3);
                }
            }
        }
    };
    EventEmitter.prototype.removeListener = function (event, listener) {
        if (this._events[event]) {
            var len = this._events[event].length;
            while (len--) {
                if (this._events[event][len] === listener) {
                    this._events[event].splice(len, 1);
                }
            }
        }
        return;
    };
    EventEmitter.prototype.removeEvent = function (event) {
        if (this._events[event]) {
            this._events[event] = null;
            delete this._events[event];
        }
    };
    EventEmitter.prototype.removeAllEvents = function () {
        for (var key in this._events) {
            if (this._events.hasOwnProperty(key)) {
                this._events[key] = null;
                delete this._events[key];
            }
        }
    };
    EventEmitter.prototype.exist = function (event) {
        return this._events[event];
    };
    return EventEmitter;
}());
exports.EventEmitter = EventEmitter;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Options = (function () {
    function Options(configuration) {
        if (!configuration.url)
            throw new Error('Url must be provided');
        if (!configuration.port)
            throw new Error('Port must be provided');
        this.url = configuration.url;
        this.port = configuration.port;
        this.autoReconnect = configuration.autoReconnect || false;
        this.reconnectInterval = configuration.reconnectInterval || 0;
        this.reconnectAttempts = configuration.reconnectAttempts || 0;
    }
    return Options;
}());
exports.Options = Options;


/***/ })
/******/ ]);
});