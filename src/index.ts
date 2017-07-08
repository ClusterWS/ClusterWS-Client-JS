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
        if (!url) {
            throw new Error('Url must be provided');
        }
        if (!port) {
            throw new Error('Port must be provided');
        }
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

    constructor(public configurations: Configurations) {
        this.events = {};
        this.channels = {};
        configurations = configurations || {};

        this.options = new Options(configurations.url, configurations.port);
        this.webSocket = new WebSocket('ws://' + this.options.url + ':' + this.options.port);

        this.webSocket.onopen = (msg: any) => {
            this._execEventFn('connect', msg);
        };

        this.webSocket.onclose = (msg: any) => {
            this._execEventFn('disconnect', msg);

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
        };

        this.webSocket.onerror = (msg: any) => {
            this._execEventFn('error', msg);
        };

        this.webSocket.onmessage = (msg: any) => {
            msg = JSON.parse(msg.data);

            if (msg.action === 'emit') {
                this._execEventFn(msg.event, msg.data);
            }

            if (msg.action === 'publish') {
                this._execChannelFn(msg.channel, msg.data);
            }
        }
    }

    _execEventFn(event: string, data?: any) {
        let exFn = this.events[event];
        if (exFn) exFn(data);
    }

    _execChannelFn(channel: string, data?: any) {
        let exFn = this.channels[channel];
        if (exFn) exFn(data);
    }

    on(event: string, fn: any) {
        if (this.events[event]) this.events[event] = null;
        this.events[event] = fn;
    }

    send(event: string, data?: any) {
        this.webSocket.send(MessageFactory.emitMessage(event, data));
    }

    subscribe(channel: string) {
        return new Channel(channel, this);
    }
}


