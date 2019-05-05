
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
      autoReconnectOptions: ({} as any), // TODO: add auto reconnect options
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

  public get readyState(): number {
    return this.socket ? this.socket.readyState : 0;
  }

  public set binaryType(type: BinaryType) {
    this.socket.binaryType = type;
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
    this.socket.binaryType = 'arraybuffer';

    this.socket.onopen = (): void => {
      // websocket connection has been open
    };

    this.socket.onclose = (): void => {
      // websocket connection is closed
    };

    this.socket.onmessage = (message: MessageEvent | Message): void => {
      let messageToProcess: Message = message;
      if (message.data) {
        // this means we run in browser
        messageToProcess = message.data;
      }

      this.withPing(messageToProcess, () => {
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

  private withPing(message: Message, next: Listener): void {
    // we should handle ping before emitting on message
    if (message.size === 1 || message.byteLength === 1) {
      const pingProcessor: Listener = (possiblePingMessage: Message): void => {
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
        reader.onload = (event: any): void => pingProcessor(event.srcElement.result);
        return reader.readAsArrayBuffer(message);
      }

      return pingProcessor(message);
    }

    return next();
  }
}