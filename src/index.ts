import {Channel} from './lib/channel/channel';
import {MessageFactory} from './lib/messages/messages';

interface Configurations {
    port: number,
    url: string
}

class Options {
    port: number;
    url: string;
    // Construct an option object
    constructor(url: string, port: number) {
        // Make sure that path and port are exist
        if (!url) throw new Error('Url must be provided');

        if (!port) throw new Error('Port must be provided');

        // Set default params in case of no params
        this.url = url;
        this.port = port;
    }
}


export class ClusterWS {
    options: Options;
    webSocket: any;
    channels: any;
    events: any;
    pingTimeOut: any;
    pingPong: number = 0;

    constructor(public configurations: Configurations) {
        this.events = {};
        this.channels = {};
        configurations = configurations || {};

        this.options = new Options(configurations.url, configurations.port);
        this.webSocket = new WebSocket('ws://' + this.options.url + ':' + this.options.port);

        this.webSocket.onopen = (msg: any) => {
            return this._execEventFn('connect', msg);
        };

        this.webSocket.onclose = (code: number, msg: any) => {
            this._execEventFn('disconnect', code, msg);

            clearInterval(this.pingTimeOut);

            for (let key in this.channels) {
                if (this.channels.hasOwnProperty(key)) {
                    this.channels[key] = null;
                    delete this.channels[key];
                }
            }

            for (let key in this.events) {
                if (this.events.hasOwnProperty(key)) {
                    this.events[key] = null;
                    delete this.events[key];
                }
            }

            for (let key in this) {
                if (this.hasOwnProperty(key)) {
                    this[key] = null;
                    delete this[key];
                }
            }
            return;
        };

        this.webSocket.onerror = (msg: any) => {
            return this._execEventFn('error', msg);
        };

        this.webSocket.onmessage = (msg: any) => {
            // Send pong message on ping
            if (msg.data === '_0') {
                // Mark that got ping
                this.pingPong = 0;
                // Send pong
                return this.webSocket.send('_1');
            }
            msg = JSON.parse(msg.data);

            if (msg.action === 'emit') {
                return this._execEventFn(msg.event, msg.data);
            }

            if (msg.action === 'publish') {
                return this._execChannelFn(msg.channel, msg.data);
            }
            if (msg.action === 'internal') {
                if (msg.event === 'config') {
                    // Run ping pong after get configurations
                    this.pingTimeOut = setInterval(() => {
                        if (this.pingPong >= 2) {
                            return this.disconnect(3001, 'Did not get ping');
                        }
                        // Mark new ping
                        return this.pingPong++;
                    }, msg.data.pingInterval);
                    return;
                }
            }
            return;
        }
    }

    _execEventFn(event: string, data?: any, msg?: any) {
        let exFn = this.events[event];
        if (exFn) {
            if (event === 'disconnect') return exFn(data, msg);
            return exFn(data);
        }
        return;
    }

    _execChannelFn(channel: string, data?: any) {
        let exFn = this.channels[channel];
        if (exFn) exFn(data);
        return;
    }

    on(event: string, fn: any) {
        if (this.events[event]) this.events[event] = null;
        return this.events[event] = fn;
    }

    send(event: string, data?: any) {
        return this.webSocket.send(MessageFactory.emitMessage(event, data));
    }

    disconnect(code?: number, message?: any) {
        this.webSocket.close(code, message)
    }

    subscribe(channel: string) {
        return new Channel(channel, this);
    }
}


