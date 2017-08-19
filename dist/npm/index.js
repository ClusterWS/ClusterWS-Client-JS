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
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var curry = function (fn) {
    return function curring() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return args.length < fn.length ?
            function () {
                var newArgs = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    newArgs[_i] = arguments[_i];
                }
                return curring.call.apply(curring, [null].concat(args, newArgs));
            } :
            fn.length ? fn.call.apply(fn, [null].concat(args)) : fn;
    };
};
var isFunction = function (f) { return f ? typeof f === 'function' ? f() : f : ''; };
var switchcase = curry(function (cases, key) { return key in cases ? isFunction(cases[key]) : isFunction(cases['default']); });
var mapArray = function (iteratee, array) {
    var index = -1;
    var length = array == null ? 0 : array.length;
    var result = new Array(length);
    while (++index < length)
        result[index] = iteratee(array[index], index, array);
    return result;
};
var mapObject = function (iteratee, object) {
    var result = {};
    object = Object(object);
    Object.keys(object).forEach(function (key) { return result[key] = iteratee(object[key], key, object); });
    return result;
};
var map = curry(function (fn, x) { return x instanceof Array ? mapArray(fn, x) : mapObject(fn, x); });
exports._ = {
    map: map,
    curry: curry,
    switchcase: switchcase
};


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var fp_1 = __webpack_require__(0);
function socketMessages(event, data, type) {
    return fp_1._.switchcase({
        'publish': JSON.stringify({ 'm': ['p', event, data] }),
        'system': JSON.stringify({ 'm': ['s', event, data] }),
        'emit': JSON.stringify({ 'm': ['e', event, data] }),
        'ping': event
    })(type);
}
exports.socketMessages = socketMessages;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.logError = function (text) { return console.log('Error: ', text); };


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var socket_1 = __webpack_require__(4);
var options_1 = __webpack_require__(7);
var ClusterWS = (function (_super) {
    __extends(ClusterWS, _super);
    function ClusterWS(configurations) {
        return _super.call(this, new options_1.Options(configurations || {})) || this;
    }
    return ClusterWS;
}(socket_1.Socket));
exports.ClusterWS = ClusterWS;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var fp_1 = __webpack_require__(0);
var channel_1 = __webpack_require__(5);
var eventemitter_1 = __webpack_require__(6);
var messages_1 = __webpack_require__(1);
var Socket = (function () {
    function Socket(options) {
        this.options = options;
        this.events = new eventemitter_1.EventEmitter();
        this.channels = {};
    }
    Socket.prototype.connect = function () {
        var _this = this;
        this.webSocket = null;
        this.webSocket = new WebSocket('ws://' + this.options.url + ':' + this.options.port);
        this.webSocket.onopen = function () { return _this.events.emit('connect'); };
        this.webSocket.onerror = function (err) { return _this.events.emit('error', err); };
        this.webSocket.onmessage = function (msg) {
            msg === '#0' ? _this.send('#1', null, 'ping') : msg = JSON.parse(msg);
            fp_1._.switchcase({
                'p': function () { },
                'e': function () { return _this.events.emit(msg.m[1], msg.m[2]); },
                's': function () { return fp_1._.switchcase({
                    'c': function () { }
                })(msg.m[1]); }
            })(msg.m[0]);
        };
        this.webSocket.onclose = function () {
        };
    };
    Socket.prototype.subscribe = function (channel) {
        return this.channels[channel] ? this.channels[channel] : this.channels[channel] = new channel_1.Channel(this.channels, this.send);
    };
    Socket.prototype.on = function (event, fn) {
        this.events.on(event, fn);
    };
    Socket.prototype.send = function (event, data, type) {
        this.webSocket.send(messages_1.socketMessages(event, data, type || 'emit'));
    };
    return Socket;
}());
exports.Socket = Socket;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var messages_1 = __webpack_require__(1);
var Channel = (function () {
    function Channel(channel, send) {
        this.channel = channel;
        this.send = send;
        this.subscribe();
    }
    Channel.prototype.watch = function (fn) {
        this.event = fn;
        return this;
    };
    Channel.prototype.publish = function (data) {
        this.send(messages_1.socketMessages(this.channel, data, 'publish'));
        return this;
    };
    Channel.prototype.unsubscribe = function () {
        this.send(messages_1.socketMessages('u', this.channel, 'system'));
    };
    Channel.prototype.subscribe = function () {
        this.send(messages_1.socketMessages('s', this.channel, 'system'));
    };
    return Channel;
}());
exports.Channel = Channel;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var fp_1 = __webpack_require__(0);
var common_1 = __webpack_require__(2);
var EventEmitter = (function () {
    function EventEmitter() {
        this._events = {};
    }
    EventEmitter.prototype.on = function (event, listener) {
        if (!listener || typeof listener !== 'function')
            common_1.logError('Listener must be a function');
        this._events[event] ? this._events[event].push(listener) : this._events[event] = [listener];
    };
    EventEmitter.prototype.emit = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        fp_1._.map(function (listener) { return listener.call.apply(listener, [null].concat(args)); }, this._events[event]);
    };
    EventEmitter.prototype.removeListener = function (event, listener) {
        var _this = this;
        fp_1._.map(function (l, index) { return l === listener ? _this._events[event].splice(index, 1) : ''; }, this._events[event]);
    };
    EventEmitter.prototype.removeEvent = function (event) {
        this._events[event] = null;
    };
    EventEmitter.prototype.removeAllEvents = function () {
        this._events = {};
    };
    EventEmitter.prototype.exist = function (event) {
        return this._events[event];
    };
    return EventEmitter;
}());
exports.EventEmitter = EventEmitter;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var common_1 = __webpack_require__(2);
var Options = (function () {
    function Options(configurations) {
        if (!configurations.url)
            throw common_1.logError('Url must be provided');
        if (!configurations.port)
            throw common_1.logError('Port must be provided');
        this.url = configurations.url;
        this.port = configurations.port;
        this.autoReconnect = configurations.autoReconnect || false;
        this.reconnectionInterval = configurations.reconnectInterval || 10000;
        this.reconnectionAttempts = configurations.reconnectAttempts || 0;
    }
    return Options;
}());
exports.Options = Options;


/***/ })
/******/ ]);
});