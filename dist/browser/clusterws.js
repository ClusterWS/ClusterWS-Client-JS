var ClusterWSClient = (function () {
  'use strict';

  var LogLevel;
  (function (LogLevel) {
      LogLevel[LogLevel["ALL"] = 0] = "ALL";
      LogLevel[LogLevel["DEBUG"] = 1] = "DEBUG";
      LogLevel[LogLevel["INFO"] = 2] = "INFO";
      LogLevel[LogLevel["WARN"] = 3] = "WARN";
      LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
  })(LogLevel || (LogLevel = {}));

  var Logger = (function () {
      function Logger(level) {
          this.level = level;
      }
      Logger.prototype.debug = function () {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments[_i];
          }
          if (this.level > LogLevel.DEBUG) {
              return;
          }
          console.log.apply(console, ["\u001B[36mdebug:\u001B[0m"].concat(args.map(function (item) { return typeof item === 'object' ? JSON.stringify(item) : item; })));
      };
      Logger.prototype.info = function () {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments[_i];
          }
          if (this.level > LogLevel.INFO) {
              return;
          }
          console.log.apply(console, ["\u001B[32minfo:\u001B[0m"].concat(args));
      };
      Logger.prototype.error = function () {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments[_i];
          }
          if (this.level > LogLevel.ERROR) {
              return;
          }
          console.log.apply(console, ["\u001B[31merror:\u001B[0m"].concat(args));
      };
      Logger.prototype.warning = function () {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments[_i];
          }
          if (this.level > LogLevel.WARN) {
              return;
          }
          console.log.apply(console, ["\u001B[33mwarning:\u001B[0m"].concat(args));
      };
      return Logger;
  }());

  function isFunction(fn) {
      return typeof fn === 'function';
  }

  var EventEmitter = (function () {
      function EventEmitter(logger) {
          this.logger = logger;
          this.events = {};
      }
      EventEmitter.prototype.on = function (event, listener) {
          if (!isFunction(listener)) {
              return this.logger.error('Listener must be a function');
          }
          this.events[event] = listener;
      };
      EventEmitter.prototype.emit = function (event) {
          var args = [];
          for (var _i = 1; _i < arguments.length; _i++) {
              args[_i - 1] = arguments[_i];
          }
          var listener = this.events[event];
          listener && listener.apply(void 0, args);
      };
      EventEmitter.prototype.exist = function (event) {
          return !!this.events[event];
      };
      EventEmitter.prototype.off = function (event) {
          delete this.events[event];
      };
      EventEmitter.prototype.removeEvents = function () {
          this.events = {};
      };
      return EventEmitter;
  }());

  var Socket = window.MozWebSocket || window.WebSocket;
  var PONG = new Uint8Array(['A'.charCodeAt(0)]).buffer;
  var ClusterWSClient = (function () {
      function ClusterWSClient(configurations) {
          this.options = {
              url: configurations.url,
              autoConnect: configurations.autoConnect !== false,
              autoReconnect: configurations.autoReconnect || false,
              autoResubscribe: configurations.autoResubscribe !== false,
              autoReconnectOptions: {
                  attempts: configurations.autoReconnectOptions ?
                      configurations.autoReconnectOptions.attempts || 0 : 0,
                  minInterval: configurations.autoReconnectOptions ?
                      configurations.autoReconnectOptions.maxInterval || 500 : 500,
                  maxInterval: configurations.autoReconnectOptions ?
                      configurations.autoReconnectOptions.maxInterval || 2000 : 2000
              },
              logger: configurations.loggerOptions && configurations.loggerOptions.logger ?
                  configurations.loggerOptions.logger :
                  new Logger(configurations.loggerOptions ? configurations.loggerOptions.level || LogLevel.ALL : LogLevel.ALL)
          };
          if (!this.options.url) {
              return this.options.logger.error('url must be provided');
          }
          this.emitter = new EventEmitter(this.options.logger);
          if (this.options.autoConnect) {
              this.connect();
          }
      }
      Object.defineProperty(ClusterWSClient.prototype, "OPEN", {
          get: function () {
              return this.socket.OPEN;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(ClusterWSClient.prototype, "CLOSED", {
          get: function () {
              return this.socket.CLOSED;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(ClusterWSClient.prototype, "readyState", {
          get: function () {
              return this.socket ? this.socket.readyState : 0;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(ClusterWSClient.prototype, "binaryType", {
          get: function () {
              return this.socket.binaryType;
          },
          set: function (binaryType) {
              this.socket.binaryType = binaryType;
          },
          enumerable: true,
          configurable: true
      });
      ClusterWSClient.prototype.connect = function () {
          var _this = this;
          if (this.isCreated) {
              return this.options.logger.error('Connect event has been called multiple times');
          }
          this.isCreated = true;
          this.socket = new Socket(this.options.url);
          this.socket.onopen = function () {
          };
          this.socket.onclose = function (codeEvent, reason) {
              _this.isCreated = false;
              var closeCode = typeof codeEvent === 'number' ? codeEvent : codeEvent.code;
              var closeReason = typeof codeEvent === 'number' ? reason : codeEvent.reason;
              _this.emitter.emit('close', closeCode, closeReason);
              if (_this.options.autoReconnect && closeCode !== 1000) {
                  if (_this.readyState === _this.CLOSED) {
                      return setTimeout(function () {
                          _this.connect();
                      }, Math.floor(Math.random() * (_this.options.autoReconnectOptions.maxInterval - _this.options.autoReconnectOptions.minInterval + 1)));
                  }
              }
              _this.emitter.removeEvents();
          };
          this.socket.onmessage = function (message) {
              var messageToProcess = message;
              if (message.data) {
                  messageToProcess = message.data;
              }
              _this.parsePing(messageToProcess, function () {
                  if (_this.emitter.exist('message')) {
                      return _this.emitter.emit('message', messageToProcess);
                  }
                  _this.processMessage(messageToProcess);
              });
          };
          this.socket.onerror = function (error) {
              if (_this.emitter.exist('error')) {
                  return _this.emitter.emit('error', error);
              }
              _this.options.logger.error(error);
              _this.close();
          };
      };
      ClusterWSClient.prototype.on = function (event, listener) {
          this.emitter.on(event, listener);
      };
      ClusterWSClient.prototype.close = function (code, reason) {
          this.socket.close(code || 1000, reason);
      };
      ClusterWSClient.prototype.processMessage = function (message) {
      };
      ClusterWSClient.prototype.parsePing = function (message, next) {
          var _this = this;
          if (message.size === 1 || message.byteLength === 1) {
              var parser_1 = function (possiblePingMessage) {
                  if (new Uint8Array(possiblePingMessage)[0] === 57) {
                      _this.socket.send(PONG);
                      return _this.emitter.emit('ping');
                  }
                  return next();
              };
              if (message instanceof Blob) {
                  var reader = new FileReader();
                  reader.onload = function (event) { return parser_1(event.srcElement.result); };
                  return reader.readAsArrayBuffer(message);
              }
              return parser_1(message);
          }
          return next();
      };
      return ClusterWSClient;
  }());

  return ClusterWSClient;

}());
