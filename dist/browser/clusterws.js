var ClusterWS = (function () {
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
  var ClusterWSClient = (function () {
      function ClusterWSClient(configurations) {
          this.options = {
              url: configurations.url,
              autoConnect: configurations.autoConnect !== false,
              autoReconnect: configurations.autoReconnect || false,
              autoResubscribe: configurations.autoResubscribe !== false,
              autoReconnectOptions: {},
              logger: configurations.loggerOptions && configurations.loggerOptions.logger ?
                  configurations.loggerOptions.logger :
                  new Logger(configurations.loggerOptions && configurations.loggerOptions.level ?
                      configurations.loggerOptions.level : LogLevel.ALL)
          };
          if (!this.options.url) {
              return this.options.logger.error('url must be provided');
          }
          this.emitter = new EventEmitter(this.options.logger);
          if (this.options.autoConnect) {
              this.connect();
          }
      }
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
          set: function (type) {
              this.socket.binaryType = type;
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
          this.socket.onclose = function () {
          };
          this.socket.onmessage = function (message) {
              var processMessage = message;
              if (message.data) {
                  processMessage = message.data;
              }
              if (_this.emitter.exist('message')) {
                  return _this.emitter.emit('message', processMessage);
              }
              _this.processMessage(processMessage);
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
      return ClusterWSClient;
  }());

  return ClusterWSClient;

}());
