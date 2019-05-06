import { Logger } from './utils/logger';
import { EventEmitter } from './utils/emitter';
import { Listener, Configurations, Options, LogLevel, Message } from './utils/types';

declare const window: any;
const Socket: any = window.MozWebSocket || window.WebSocket;
const PONG: any = new Uint8Array(['A'.charCodeAt(0)]).buffer;

export default class ClusterWSClient {
  private socket: WebSocket;
  private emitter: EventEmitter;
  private options: Options;

  private isCreated: boolean;

  constructor(configurations: Configurations) {
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

  public get OPEN(): number {
    return this.socket.OPEN;
  }

  public get CLOSED(): number {
    return this.socket.CLOSED;
  }

  public get readyState(): number {
    return this.socket ? this.socket.readyState : 0;
  }

  public set binaryType(binaryType: BinaryType) {
    this.socket.binaryType = binaryType;
  }

  public get binaryType(): BinaryType {
    return this.socket.binaryType;
  }

  public connect(): void {
    if (this.isCreated) {
      return this.options.logger.error('Connect event has been called multiple times');
    }

    this.isCreated = true;
    this.socket = new Socket(this.options.url);

    this.socket.onopen = (): void => {
      // TODO: reset attempts
      // websocket connection has been open
    };

    this.socket.onclose = (codeEvent: CloseEvent | number, reason?: string): any => {
      this.isCreated = false;
      const closeCode: number = typeof codeEvent === 'number' ? codeEvent : codeEvent.code;
      const closeReason: string = typeof codeEvent === 'number' ? reason : codeEvent.reason;

      this.emitter.emit('close', closeCode, closeReason);

      if (this.options.autoReconnect && closeCode !== 1000) {
        // TODO: add limited number of attempts
        if (this.readyState === this.CLOSED) {

          // This will trigger reconnect in between maxInterval and minInterval time
          return setTimeout(() => {
            this.connect();
          }, Math.floor(Math.random() * (this.options.autoReconnectOptions.maxInterval - this.options.autoReconnectOptions.minInterval + 1)));
        }
      }

      // clean up connection events
      this.emitter.removeEvents();
    };

    this.socket.onmessage = (message: MessageEvent | Message): void => {
      let messageToProcess: Message = message;
      if (message.data) {
        // this means we run in browser
        messageToProcess = message.data;
      }

      this.parsePing(messageToProcess, () => {
        if (this.emitter.exist('message')) {
          return this.emitter.emit('message', messageToProcess);
        }

        this.processMessage(messageToProcess);
      });
    };

    this.socket.onerror = (error: ErrorEvent): void => {
      if (this.emitter.exist('error')) {
        return this.emitter.emit('error', error);
      }
      // if error catch is not there then we can close connection on any error
      this.options.logger.error(error);
      this.close();
    };
  }

  // TODO: make sure we implement on message event properly
  // on message, on ping, on close, on error are reserved events
  public on(event: string, listener: Listener): void {
    this.emitter.on(event, listener);
  }

  public close(code?: number, reason?: string): void {
    this.socket.close(code || 1000, reason);
  }

  public processMessage(message: Message): void {
    // write message processor
  }

  private parsePing(message: Message, next: Listener): void {
    // we should handle ping before emitting on message
    if (message.size === 1 || message.byteLength === 1) {
      const parser: Listener = (possiblePingMessage: Message): void => {
        if (new Uint8Array(possiblePingMessage)[0] === 57) {
          // this is our ping need to send pong response and trigger ping
          this.socket.send(PONG);
          return this.emitter.emit('ping');
        }

        return next();
      };

      if (message instanceof Blob) {
        // transform blob to arrayBuffer
        const reader: FileReader = new FileReader();
        reader.onload = (event: any): void => parser(event.srcElement.result);
        return reader.readAsArrayBuffer(message);
      }

      return parser(message);
    }

    return next();
  }
}