
import { Logger } from './utils/logger';
import { EventEmitter } from './utils/emitter';
import { Listener, Configurations, Options, LogLevel, Message } from './utils/types';

declare const window: any;
const Socket: any = window.MozWebSocket || window.WebSocket;

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

    this.socket.onopen = (): void => {
      // websocket connection has been open
    };

    this.socket.onclose = (): void => {
      // websocket connection is closed
    };

    this.socket.onmessage = (message: MessageEvent | Message): void => {
      let processMessage: Message = message;
      if (message.data) {
        // this means it is browser
        processMessage = message.data;
      }

      // Send message event if it was requested by user
      if (this.emitter.exist('message')) {
        return this.emitter.emit('message', processMessage);
      }

      this.processMessage(processMessage);
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
}