import {Channel} from './lib/channel/channel';
import {MessageFactory} from './lib/messages/messages';
import {EventEmitter} from './lib/eventEmitter/eventEmitter';
import {Options, Configurations} from './lib/options';


export class ClusterWS {

    options: Options;
    channels: any = {};
    webSocket: any;
    missedPing: number = 0;
    pingTimeOut: any;
    eventEmitter: EventEmitter;


    // Reconnection options
    inReconnectState: boolean = false;
    reconnectAttempts: number = 0;
    reconnectInterval: any;
    autoReconnect: boolean;


    constructor(public configurations: Configurations) {
        this.configurations = this.configurations || {};

        this.options = new Options(this.configurations);
        this.eventEmitter = new EventEmitter();
        this.autoReconnect = this.options.autoReconnect;
        this._connect();
    }

    on(event: string, fn: any) {
        this.eventEmitter.on(event, fn);
    }

    send(event: string, data?: any) {
        return this.webSocket.send(MessageFactory.emitMessage(event, data));
    }

    disconnect(code?: number, message?: any) {
        this.webSocket.close(code, message)
    }

    subscribe(channel: string) {
        if (this.channels[channel]) return this.channels[channel];
        this.channels[channel] = new Channel(channel, this);
        return this.channels[channel];
    }

    _connect() {
        this.webSocket = null;
        this.webSocket = new WebSocket('ws://' + this.options.url + ':' + this.options.port);

        this._listenOnOpen();
        this._listenOnMessage();
        this._listenOnError();
        this._listenOnClose();
    }

    /**
     * On open browser WebSocket
     * emit event 'connect' to the user
     */
    _listenOnOpen() {
        this.webSocket.onopen = (msg: any) => {
            this.reconnectAttempts = 0;
            this.inReconnectState = false;
            clearInterval(this.reconnectInterval);

            this._resubscribeChannels();
            this.eventEmitter.emit('connect', msg);
        };
    }

    /**
     * Get messages from the server , modify them and
     * redirect it to the user
     */
    _listenOnMessage() {
        this.webSocket.onmessage = (msg: any) => {

            if (msg.data === '_0') {
                this.missedPing = 0;
                return this.webSocket.send('_1');
            }

            try {
                msg = JSON.parse(msg.data);
            } catch (e) {
                return this.disconnect(1007);
            }

            switch (msg.action) {
                case 'emit':
                    this.eventEmitter.emit(msg.event, msg.data);
                    break;
                case 'publish':
                    this.channels[msg.channel]._newMessage(msg.data);
                    break;
                case 'internal':
                    if (msg.event === 'config') {
                        this.pingTimeOut = setInterval(() => {
                            if (this.missedPing > 2) {
                                return this.disconnect(3001, 'Did not get ping');
                            }
                            return this.missedPing++;
                        }, msg.data.pingInterval);
                    }
                    break;
                default:
                    break;
            }
        }
    }

    /**
     * On close browser WebSocket
     * emit event 'disconnect' to the user
     *
     * clear all data about WebSocket from memory
     */
    _listenOnClose() {
        this.webSocket.onclose = (code?: number, msg?: any) => {
            this.eventEmitter.emit('disconnect', code, msg);

            clearInterval(this.pingTimeOut);

            if (!this.autoReconnect || code === 1000) {
                this.eventEmitter.removeAllEvents();

                for (let key in this.channels) {
                    if (this.channels.hasOwnProperty(key)) {
                        this.channels[key] = null;
                        delete this.channels[key];
                    }
                }

                for (let key in this) {
                    if (this.hasOwnProperty(key)) {
                        this[key] = null;
                        delete this[key];
                    }
                }
            } else if (!this.inReconnectState) {
                this._reconnect();
            }
        };
    }

    _resubscribeChannels(){
        for (let key in this.channels) {
            if (this.channels.hasOwnProperty(key)) {
                this.channels[key]._subscribe();
            }
        }
    }

    _reconnect() {
        this.inReconnectState = true;
        this.reconnectInterval = setInterval(() => {
            if (this.webSocket.readyState === this.webSocket.CLOSED) {
                this.reconnectAttempts++;
                this._connect();
            }
            if (this.options.reconnectAttempts !== 0) {
                if (this.reconnectAttempts >= this.options.reconnectAttempts) {
                    this.autoReconnect = false;
                    return clearInterval(this.reconnectInterval)
                }
            }
        }, this.options.reconnectInterval);
    }

    /**
     * On error browser WebSocket
     * emit event 'error' to the user
     */
    _listenOnError() {
        this.webSocket.onerror = (msg: any) => {
            this.eventEmitter.emit('error', msg);
        };
    }
}