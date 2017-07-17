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
function socketReconnect(self) {
    self.inReconnectState = true;
    self.reconnectInterval = setInterval(function () {
        if (self.webSocket.readyState === self.webSocket.CLOSED) {
            self.reconnectAttempts++;
            self.connect();
            if (self.options.reconnectAttempts !== 0) {
                if (self.reconnectAttempts >= self.options.reconnectAttempts) {
                    self.autoReconnect = false;
                    return clearInterval(self.reconnectInterval);
                }
            }
        }
    }, self.options.reconnectInterval);
}
exports.socketReconnect = socketReconnect;
;
function socketSuccessfulReconnection(self) {
    self.reconnectAttempts = 0;
    self.inReconnectState = false;
    clearInterval(self.reconnectInterval);
    for (var key in self.channels) {
        if (self.channels.hasOwnProperty(key)) {
            self.channels[key]._subscribe();
        }
    }
}
exports.socketSuccessfulReconnection = socketSuccessfulReconnection;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var channel_1 = __webpack_require__(2);
var messages_1 = __webpack_require__(3);
var eventEmitter_1 = __webpack_require__(4);
var options_1 = __webpack_require__(5);
var socketOpen_1 = __webpack_require__(6);
var socketMessage_1 = __webpack_require__(7);
var socketClose_1 = __webpack_require__(8);
var socketError_1 = __webpack_require__(9);
var ClusterWS = (function () {
    function ClusterWS(configurations) {
        this.configurations = configurations;
        this.channels = {};
        this.missedPing = 0;
        this.inReconnectState = false;
        this.reconnectAttempts = 0;
        this.configurations = this.configurations || {};
        this.options = new options_1.Options(this.configurations);
        this.autoReconnect = this.options.autoReconnect;
        this.eventEmitter = new eventEmitter_1.EventEmitter();
        this.connect();
    }
    ClusterWS.prototype.on = function (event, fn) {
        this.eventEmitter.on(event, fn);
    };
    ClusterWS.prototype.send = function (event, data, type) {
        switch (type) {
            case 'pong':
                this.webSocket.send(event);
                break;
            case 'internal':
                this.webSocket.send(messages_1.MessageFactory.internalMessage(event, data));
                break;
            case 'publish':
                this.webSocket.send(messages_1.MessageFactory.publishMessage(event, data));
                break;
            default:
                this.webSocket.send(messages_1.MessageFactory.emitMessage(event, data));
                break;
        }
    };
    ClusterWS.prototype.disconnect = function (code, message) {
        this.webSocket.close(code, message);
    };
    ClusterWS.prototype.subscribe = function (channel) {
        if (this.channels[channel])
            return this.channels[channel];
        this.channels[channel] = new channel_1.Channel(channel, this);
        return this.channels[channel];
    };
    ClusterWS.prototype.connect = function () {
        this.webSocket = null;
        this.webSocket = new WebSocket('ws://' + this.options.url + ':' + this.options.port);
        socketOpen_1.socketOpen(this);
        socketMessage_1.socketMessage(this);
        socketClose_1.socketClose(this);
        socketError_1.socketError(this);
    };
    return ClusterWS;
}());
exports.ClusterWS = ClusterWS;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Channel = (function () {
    function Channel(channel, client) {
        this.channel = channel;
        this.client = client;
        this._subscribe();
    }
    Channel.prototype.watch = function (fn) {
        this.event = fn;
        return this;
    };
    Channel.prototype.publish = function (data) {
        console.log(data);
        this.client.send(this.channel, data, 'publish');
        return this;
    };
    Channel.prototype._message = function (data) {
        if (this.event)
            this.event(data);
        return;
    };
    Channel.prototype._subscribe = function () {
        this.client.send('subscribe', this.channel, 'internal');
    };
    return Channel;
}());
exports.Channel = Channel;


/***/ }),
/* 3 */
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
/* 4 */
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
        if (this.exist(event))
            return;
        return this._events[event] = listener;
    };
    EventEmitter.prototype.emit = function (event) {
        var rest = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            rest[_i - 1] = arguments[_i];
        }
        if (this.exist(event))
            this._events[event].apply(this, rest);
    };
    EventEmitter.prototype.removeEvent = function (event) {
        if (this.exist(event)) {
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
/* 5 */
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
        this.reconnectInterval = configuration.reconnectInterval || 10000;
        this.reconnectAttempts = configuration.reconnectAttempts || 0;
    }
    return Options;
}());
exports.Options = Options;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var socketReconnect_1 = __webpack_require__(0);
function socketOpen(self) {
    self.webSocket.onopen = function (msg) {
        socketReconnect_1.socketSuccessfulReconnection(self);
        self.eventEmitter.emit('connect', msg);
    };
}
exports.socketOpen = socketOpen;
;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function socketMessage(self) {
    self.webSocket.onmessage = function (msg) {
        if (msg.data === '_0') {
            self.missedPing = 0;
            return self.send('_1', null, 'pong');
        }
        try {
            msg = JSON.parse(msg.data);
        }
        catch (e) {
            return self.disconnect(1007);
        }
        switch (msg.action) {
            case 'emit':
                self.eventEmitter.emit(msg.event, msg.data);
                break;
            case 'publish':
                self.channels[msg.channel]._message(msg.data);
                break;
            case 'internal':
                if (msg.event === 'config') {
                    self.pingTimeOut = setInterval(function () {
                        if (self.missedPing > 2) {
                            return self.disconnect(3001, 'Did not get ping');
                        }
                        return self.missedPing++;
                    }, msg.data.pingInterval);
                }
                break;
            default:
                break;
        }
    };
}
exports.socketMessage = socketMessage;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var socketReconnect_1 = __webpack_require__(0);
function socketClose(self) {
    self.webSocket.onclose = function (code, msg) {
        self.eventEmitter.emit('disconnect', code, msg);
        clearInterval(self.pingTimeOut);
        if (!self.autoReconnect || code === 1000) {
            self.eventEmitter.removeAllEvents();
            for (var key in self.channels) {
                if (self.channels.hasOwnProperty(key)) {
                    self.channels[key] = null;
                    delete self.channels[key];
                }
            }
            for (var key in self) {
                if (self.hasOwnProperty(key)) {
                    self[key] = null;
                    delete self[key];
                }
            }
        }
        else if (!self.inReconnectState) {
            socketReconnect_1.socketReconnect(self);
        }
    };
}
exports.socketClose = socketClose;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function socketError(self) {
    self.webSocket.onerror = function (msg) {
        self.eventEmitter.emit('error', msg);
    };
}
exports.socketError = socketError;


/***/ })
/******/ ]);
});