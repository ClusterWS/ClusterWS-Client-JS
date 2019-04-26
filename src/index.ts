
import { EventEmitter } from './utils/emitter';
import { Listener } from './utils/types';

declare const window: any;
const Socket: any = window.MozWebSocket || window.WebSocket;

export default class ClusterWS {
  private socket: WebSocket;
  private events: EventEmitter;

  constructor(private options: any) {
    // TODO: add logger
    this.events = new EventEmitter({});

    if (this.options.autoConnect) {
      this.connect();
    }
  }

  public connect(): void {
    // TODO: write connection logic
  }

  // TODO: emit on ping and on pong events
  public on(event: string, listener: Listener): void {
    this.events.on(event, listener);
  }

}