import { EventEmitter } from './utils/emitter';
import { decode, encode } from './modules/parser';
import { Channels, Channel } from './modules/channels';
import { Listener, Configurations, Options, Message } from './utils/types';

declare const window: any;
const Socket: any = window.MozWebSocket || window.WebSocket;
const PONG: any = new Uint8Array(['A'.charCodeAt(0)]).buffer;

// TODO:
// - implement d.ts file

export default class ClusterWSClient {
  private socket: WebSocket;
  private emitter: EventEmitter;
  private options: Options;
  private channels: Channels;

  private isCreated: boolean;
  private reconnectAttempts: number = 0;

  private autoPing: boolean;
  private pingInterval: number;
  private pingTimeout: any;

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
      throw new Error('Connect event has been called multiple times');
    }

    this.isCreated = true;
    this.socket = new Socket(this.options.url);

    this.socket.onopen = (): void => {
      this.reconnectAttempts = this.options.autoReconnectOptions.attempts;
      this.options.autoResubscribe ?
        this.channels.resubscribe() :
        this.channels.removeAllChannels();

      this.emitter.emit('open');
    };

    this.socket.onclose = (codeEvent: CloseEvent | number, reason?: string): any => {
      clearTimeout(this.pingTimeout);
      this.isCreated = false;
      const closeCode: number = typeof codeEvent === 'number' ? codeEvent : codeEvent.code;
      const closeReason: string = typeof codeEvent === 'number' ? reason : codeEvent.reason;

      this.emitter.emit('close', closeCode, closeReason);

      if (this.options.autoReconnect && closeCode !== 1000) {
        if (this.readyState === this.CLOSED) {
          if (this.options.autoReconnectOptions.attempts === 0 || this.reconnectAttempts > 0) {
            this.reconnectAttempts--;
            return setTimeout(() => {
              this.connect();
            }, Math.floor(Math.random() * (this.options.autoReconnectOptions.maxInterval - this.options.autoReconnectOptions.minInterval + 1)));
          }
        }
      }

      // clean up connection events if we are done with this socket
      this.emitter.removeEvents();
      this.channels.removeAllChannels();
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
      this.close();
      throw new Error('Connect event has been called multiple times');
    };
  }

  // TODO: make sure we implement on message event properly
  // on message, on ping, on close, on error are reserved events
  public on(event: string, listener: Listener): void {
    this.emitter.on(event, listener);
  }

  // TODO: add overload to this function
  public send(event: string, message: Message, eventType: string = 'emit'): void {
    // we swap to default websocket send if no event and message provided correctly
    if (message === undefined) {
      return this.socket.send(event);
    }

    return this.socket.send(encode(event, message, eventType));
  }

  public close(code?: number, reason?: string): void {
    this.socket.close(code || 1000, reason);
  }

  public subscribe(channelName: string): Channel {
    return this.channels.subscribe(channelName);
  }

  public getChannelByName(channelName: string): Channel {
    return this.channels.getChannelByName(channelName);
  }

  public processMessage(message: Message): void {
    // write message processor
    try {
      if (message instanceof Array) {
        return decode(this as any, message);
      }

      if (typeof message !== 'string') {
        const err: Error = new Error('processMessage accepts only string or array types');
        if (this.emitter.exist('error')) {
          return this.emitter.emit('error', err);
        }

        throw err;
      }

      if (message[0] !== '[') {
        const err: Error = new Error('processMessage received incorrect message');
        if (this.emitter.exist('error')) {
          return this.emitter.emit('error', err);
        }

        throw err;
      }

      return decode(this as any, JSON.parse(message));
    } catch (err) {
      // This will parse the rest of the errors
      if (this.emitter.exist('error')) {
        return this.emitter.emit('error', err);
      }

      this.close();
      throw err;
    }
  }

  private parsePing(message: Message, next: Listener): void {
    // we should handle ping before emitting on message
    if (message.size === 1 || message.byteLength === 1) {
      const parser: Listener = (possiblePingMessage: Message): void => {
        if (new Uint8Array(possiblePingMessage)[0] === 57) {
          // this is our ping need to send pong response and trigger ping
          this.resetPing();
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

  private resetPing(): void {
    clearTimeout(this.pingTimeout);
    if (this.pingInterval && this.autoPing) {
      this.pingTimeout = setTimeout(() => {
        this.close(4001, `No ping received in ${this.pingInterval + 500}ms`);
      }, this.pingInterval + 500);
    }
  }
}