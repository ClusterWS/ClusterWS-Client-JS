import { ClusterWS } from '../../../index';
import { MessageFactory } from '../messages/messages';


export class Channel {
    event: any;

    constructor(public channel: string, public client: ClusterWS) {
        this._subscribe();
    }

    watch(fn: any) {
        this.event = fn;
        return this;
    }

    publish(data: any) {
        console.log(data);
        this.client.send(this.channel, data, 'publish');
        return this;
    }

    _message(data: any) {
        if (this.event) this.event(data);
        return;
    }

    _subscribe() {
        this.client.send('subscribe', this.channel, 'internal');
    }
}