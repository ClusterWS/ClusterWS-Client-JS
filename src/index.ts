import {Options} from './lib/options';
import {Channel} from './lib/channel';
import {MessageFactory} from './lib/messages/messages';

interface Configurations {
    port: number,
    url: string
}

export  class ClusterWS {
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

        this.webSocket.onopen = (data:any) => {
            this._execEvent('connect', data);
        };

        this.webSocket.onclose = (data:any) => {
            this._execEvent('close', data);
        };

        this.webSocket.onerror = (data:any) => {
            this._execEvent('error', data);
        };

        this.webSocket.onmessage = (data:any) => {
            data = JSON.parse(data.data);

            if (data.action === 'emit') {
                this._execEvent(data.event, data.data);
            }

            if (data.action === 'publish') {
                this._execChannel(data.channel, data.data);
            }
        }
    }

    _execEvent(event: string, data?: any) {
        let exFn = this.events[event];
        if (exFn) exFn(data);
    }

    _execChannel(channel: string, data?: any) {
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


