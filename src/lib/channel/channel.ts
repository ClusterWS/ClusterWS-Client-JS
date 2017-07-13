import {ClusterWS} from '../../index';
import {MessageFactory} from '../messages/messages';


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
        this.client.webSocket.send(MessageFactory.publishMessage(this.channel, data));
        return this;
    }

    _newMessage(data: any) {
        if (this.event) this.event(data);
        return;
    }
    _subscribe() {
        this.client.webSocket.send(MessageFactory.internalMessage('subscribe', this.channel));
    }
}