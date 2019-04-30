
import { EventEmitter } from './utils/emitter';
import { Listener, Configurations, Options } from './utils/types';

declare const window: any;
const Socket: any = window.MozWebSocket || window.WebSocket;

export default class ClusterWSClient {
  private socket: WebSocket;
  private events: EventEmitter;
  private options: Options;

  private isCreated: boolean;

  constructor(configurations: Configurations) {
    // TODO: build correct options
    this.options = (configurations as any);
    // TODO: add logger
    this.events = new EventEmitter({});

    if (this.options.autoConnect) {
      this.connect();
    }
  }

  public connect(): void {
    if (this.isCreated) {
      // TODO: Add logger
      return console.log('Instance exists');
    }

    this.isCreated = true;
    this.socket = new Socket(this.options.url);

    this.socket.onopen = (): void => {
      // websocket connection has been open
    };

    this.socket.onclose = (): void => {
      // websocket connection is closed
    };

    this.socket.onmessage = (): void => {
      // new message received
    };

    this.socket.onerror = (): void => {
      // there are some error
    };
  }

  // TODO: emit on ping and on pong events
  public on(event: string, listener: Listener): void {
    this.events.on(event, listener);
  }

}