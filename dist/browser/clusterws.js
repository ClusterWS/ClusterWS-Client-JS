var ClusterWS = (function () {
  'use strict';

  function isFunction(fn) {
      return typeof fn === 'function';
  }

  var EventEmitter = (function () {
      function EventEmitter() {
          this.events = {};
      }
      EventEmitter.prototype.on = function (event, listener) {
          if (!isFunction(listener)) {
              throw new Error('Listener must be a function');
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

  function decode(socket, data) {
      var msgType = data[0], param = data[1], message = data[2];
      if (msgType === 'e') {
          return socket.emitter.emit(param, message);
      }
      if (msgType === 'p') {
          var channels = Object.keys(message);
          for (var i = 0, len = channels.length; i < len; i++) {
              var channel = channels[i];
              var messages = message[channel];
              for (var j = 0, msgLen = messages.length; j < msgLen; j++) {
                  socket.channels.channelNewMessage(channel, messages[j]);
              }
          }
      }
      if (msgType === 's') {
          if (param === 's') {
              var channels = Object.keys(message);
              for (var i = 0, len = channels.length; i < len; i++) {
                  var channel = channels[i];
                  socket.channels.channelSetStatus(channel, message[channel]);
              }
          }
          if (param === 'c') {
              socket.autoPing = message.autoPing;
              socket.pingInterval = message.pingInterval;
              socket.resetPing();
          }
      }
  }
  function encode(event, data, eventType) {
      var message = {
          emit: ['e', event, data],
          publish: ['p', event, data],
          system: {
              subscribe: ['s', 's', data],
              unsubscribe: ['s', 'u', data],
              configuration: ['s', 'c', data]
          }
      };
      if (eventType === 'system') {
          return JSON.stringify(message[eventType][event]);
      }
      return JSON.stringify(message[eventType]);
  }

  var Channel = (function () {
      function Channel(client, name) {
          this.client = client;
          this.name = name;
          this.READY = 1;
          this.status = 0;
          this.events = {};
          this.watchers = [];
          if (this.client.readyState === this.client.OPEN) {
              this.client.send('subscribe', [this.name], 'system');
          }
      }
      Channel.prototype.on = function (event, listener) {
          this.events[event] = listener;
      };
      Channel.prototype.publish = function (message) {
          if (this.status === this.READY) {
              this.client.send(this.name, message, 'publish');
          }
      };
      Channel.prototype.setWatcher = function (listener) {
          this.watchers.push(listener);
      };
      Channel.prototype.removeWatcher = function (listener) {
          for (var i = 0, len = this.watchers.length; i < len; i++) {
              if (this.watchers[i] === listener) {
                  this.watchers.splice(i, 1);
                  break;
              }
          }
      };
      Channel.prototype.unsubscribe = function () {
          this.status = 0;
          this.emit('unsubscribed');
          this.client.channels.removeChannel(this.name);
          this.client.send('unsubscribe', this.name, 'system');
      };
      Channel.prototype.emit = function (event) {
          var listener = this.events[event];
          listener && listener();
      };
      Channel.prototype.broadcast = function (message) {
          for (var i = 0, len = this.watchers.length; i < len; i++) {
              this.watchers[i](message);
          }
      };
      return Channel;
  }());
  var Channels = (function () {
      function Channels(client) {
          this.client = client;
          this.channels = {};
      }
      Channels.prototype.subscribe = function (channelName) {
          if (!this.channels[channelName]) {
              var channel = new Channel(this.client, channelName);
              this.channels[channelName] = channel;
              return channel;
          }
      };
      Channels.prototype.resubscribe = function () {
          var allChannels = Object.keys(this.channels);
          if (allChannels.length) {
              this.client.send('subscribe', allChannels, 'system');
          }
      };
      Channels.prototype.getChannelByName = function (channelName) {
          return this.channels[channelName] || null;
      };
      Channels.prototype.channelNewMessage = function (channelName, message) {
          var channel = this.channels[channelName];
          if (channel && channel.status === channel.READY) {
              channel.broadcast(message);
          }
      };
      Channels.prototype.channelSetStatus = function (channelName, pass) {
          var channel = this.channels[channelName];
          if (channel) {
              if (!pass) {
                  channel.emit('canceled');
                  return this.removeChannel(channelName);
              }
              channel.status = 1;
              channel.emit('subscribed');
          }
      };
      Channels.prototype.removeChannel = function (channelName) {
          delete this.channels[channelName];
      };
      Channels.prototype.removeAllChannels = function () {
          this.channels = {};
      };
      return Channels;
  }());

  var Socket = window.MozWebSocket || window.WebSocket;
  var PONG = new Uint8Array(['A'.charCodeAt(0)]).buffer;
  var ClusterWS = (function () {
      function ClusterWS(configurations) {
          this.reconnectAttempts = 0;
          this.options = {
              url: configurations.url,
              autoConnect: configurations.autoConnect !== false,
              autoReconnect: configurations.autoReconnect || false,
              autoResubscribe: configurations.autoResubscribe !== false,
              autoReconnectOptions: {
                  attempts: configurations.autoReconnectOptions ?
                      configurations.autoReconnectOptions.attempts || 0 : 0,
                  minInterval: configurations.autoReconnectOptions ?
                      configurations.autoReconnectOptions.minInterval || 500 : 500,
                  maxInterval: configurations.autoReconnectOptions ?
                      configurations.autoReconnectOptions.maxInterval || 2000 : 2000
              }
          };
          if (!this.options.url) {
              throw new Error('url must be provided');
          }
          this.emitter = new EventEmitter();
          this.channels = new Channels(this);
          this.reconnectAttempts = this.options.autoReconnectOptions.attempts;
          if (this.options.autoConnect) {
              this.connect();
          }
      }
      Object.defineProperty(ClusterWS.prototype, "OPEN", {
          get: function () {
              return this.socket.OPEN;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(ClusterWS.prototype, "CLOSED", {
          get: function () {
              return this.socket.CLOSED;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(ClusterWS.prototype, "readyState", {
          get: function () {
              return this.socket ? this.socket.readyState : 0;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(ClusterWS.prototype, "binaryType", {
          get: function () {
              return this.socket.binaryType;
          },
          set: function (binaryType) {
              this.socket.binaryType = binaryType;
          },
          enumerable: true,
          configurable: true
      });
      ClusterWS.prototype.connect = function () {
          var _this = this;
          if (this.isCreated) {
              throw new Error('Connect event has been called multiple times');
          }
          this.isCreated = true;
          this.socket = new Socket(this.options.url);
          this.socket.onopen = function () {
              _this.reconnectAttempts = _this.options.autoReconnectOptions.attempts;
              _this.options.autoResubscribe ?
                  _this.channels.resubscribe() :
                  _this.channels.removeAllChannels();
              _this.emitter.emit('open');
          };
          this.socket.onclose = function (codeEvent, reason) {
              clearTimeout(_this.pingTimeout);
              _this.isCreated = false;
              var closeCode = typeof codeEvent === 'number' ? codeEvent : codeEvent.code;
              var closeReason = typeof codeEvent === 'number' ? reason : codeEvent.reason;
              _this.emitter.emit('close', closeCode, closeReason);
              if (_this.options.autoReconnect && closeCode !== 1000) {
                  if (_this.readyState === _this.CLOSED) {
                      if (_this.options.autoReconnectOptions.attempts === 0 || _this.reconnectAttempts > 0) {
                          _this.reconnectAttempts--;
                          return setTimeout(function () {
                              _this.connect();
                          }, Math.floor(Math.random() * (_this.options.autoReconnectOptions.maxInterval - _this.options.autoReconnectOptions.minInterval + 1)));
                      }
                  }
              }
              _this.emitter.removeEvents();
              _this.channels.removeAllChannels();
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
              _this.close();
              throw new Error('Connect event has been called multiple times');
          };
      };
      ClusterWS.prototype.on = function (event, listener) {
          this.emitter.on(event, listener);
      };
      ClusterWS.prototype.send = function (event, message, eventType) {
          if (eventType === void 0) { eventType = 'emit'; }
          if (message === undefined) {
              return this.socket.send(event);
          }
          return this.socket.send(encode(event, message, eventType));
      };
      ClusterWS.prototype.close = function (code, reason) {
          this.socket.close(code || 1000, reason);
      };
      ClusterWS.prototype.subscribe = function (channelName) {
          return this.channels.subscribe(channelName);
      };
      ClusterWS.prototype.getChannelByName = function (channelName) {
          return this.channels.getChannelByName(channelName);
      };
      ClusterWS.prototype.processMessage = function (message) {
          try {
              if (message instanceof Array) {
                  return decode(this, message);
              }
              if (typeof message !== 'string') {
                  var err = new Error('processMessage accepts only string or array types');
                  if (this.emitter.exist('error')) {
                      return this.emitter.emit('error', err);
                  }
                  throw err;
              }
              if (message[0] !== '[') {
                  var err = new Error('processMessage received incorrect message');
                  if (this.emitter.exist('error')) {
                      return this.emitter.emit('error', err);
                  }
                  throw err;
              }
              return decode(this, JSON.parse(message));
          }
          catch (err) {
              if (this.emitter.exist('error')) {
                  return this.emitter.emit('error', err);
              }
              this.close();
              throw err;
          }
      };
      ClusterWS.prototype.parsePing = function (message, next) {
          var _this = this;
          if (message.size === 1 || message.byteLength === 1) {
              var parser_1 = function (possiblePingMessage) {
                  if (new Uint8Array(possiblePingMessage)[0] === 57) {
                      _this.resetPing();
                      _this.socket.send(PONG);
                      return _this.emitter.emit('ping');
                  }
                  return next();
              };
              if (!(message instanceof ArrayBuffer)) {
                  var reader = new FileReader();
                  reader.onload = function (event) { return parser_1(event.srcElement.result); };
                  return reader.readAsArrayBuffer(message);
              }
              return parser_1(message);
          }
          return next();
      };
      ClusterWS.prototype.resetPing = function () {
          var _this = this;
          clearTimeout(this.pingTimeout);
          if (this.pingInterval && this.autoPing) {
              this.pingTimeout = setTimeout(function () {
                  _this.close(4001, "No ping received in " + (_this.pingInterval + 500) + "ms");
              }, this.pingInterval + 500);
          }
      };
      return ClusterWS;
  }());

  return ClusterWS;

}());
