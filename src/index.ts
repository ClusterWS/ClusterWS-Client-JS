import { Channel } from './lib/modules/channel/channel';
import { MessageFactory } from './lib/modules/messages/messages';
import { EventEmitter } from './lib/modules/eventEmitter/eventEmitter';
import { Options, Configurations } from './lib/options';

import { socketOpen } from './lib/modules/socket/socketOpen';
import { socketMessage } from './lib/modules/socket/socketMessage';
import { socketClose } from './lib/modules/socket/socketClose';
import { socketError } from './lib/modules/socket/socketError';


export class ClusterWS {

    options: Options;
    channels: any = {};
    webSocket: any;
    missedPing: number = 0;
    pingTimeOut: any;
    eventEmitter: EventEmitter;

    // Reconnection helper options
    autoReconnect: boolean;
    inReconnectState: boolean = false;
    reconnectAttempts: number = 0;
    reconnectInterval: any;

    constructor(public configurations: Configurations) {
        this.configurations = this.configurations || {};

        this.options = new Options(this.configurations);

        this.autoReconnect = this.options.autoReconnect;

        this.eventEmitter = new EventEmitter();
        this.connect();
    }

    on(event: string, fn: any) {
        this.eventEmitter.on(event, fn);
    }

    send(event: string, data?: any, type?: string) {
        switch (type) {
            case 'pong':
                this.webSocket.send(event);
                break;
            case 'internal':
                this.webSocket.send(MessageFactory.internalMessage(event, data));
                break;
            case 'publish':
                this.webSocket.send(MessageFactory.publishMessage(event, data));
                break;
            default:
                this.webSocket.send(MessageFactory.emitMessage(event, data));
                break;
        }
    }

    disconnect(code?: number, message?: any) {
        this.webSocket.close(code, message)
    }

    subscribe(channel: string) {
        if (this.channels[channel]) return this.channels[channel];
        this.channels[channel] = new Channel(channel, this);
        return this.channels[channel];
    }

    connect() {
        this.webSocket = null;
        this.webSocket = new WebSocket('ws://' + this.options.url + ':' + this.options.port);

        socketOpen(this);
        socketMessage(this);
        socketClose(this);
        socketError(this);
    }
}