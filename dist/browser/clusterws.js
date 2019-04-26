var ClusterWS = (function () {
  'use strict';

  function isFunction(fn) {
      return typeof fn === 'function';
  }

  class EventEmitter {
      constructor(logger) {
          this.logger = logger;
          this.events = {};
      }
      on(event, listener) {
          if (!isFunction(listener)) {
              return this.logger.error('Listener must be a function');
          }
          this.events[event] = listener;
      }
      emit(event, ...args) {
          const listener = this.events[event];
          listener && listener(...args);
      }
      exist(event) {
          return !!this.events[event];
      }
      off(event) {
          delete this.events[event];
      }
      removeEvents() {
          this.events = {};
      }
  }

  const Socket = window.MozWebSocket || window.WebSocket;
  class ClusterWS {
      constructor(options) {
          this.options = options;
          this.events = new EventEmitter({});
          if (this.options.autoConnect) {
              this.connect();
          }
      }
      connect() {
      }
      on(event, listener) {
          this.events.on(event, listener);
      }
  }

  return ClusterWS;

}());
