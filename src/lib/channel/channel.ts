import {ClusterWS} from '../../index';
import {MessageFactory} from '../messages/messages';


export class Channel {
    constructor(public channel: string, public client: ClusterWS) {
        this.client.webSocket.send(MessageFactory.internalMessage('subscribe', this.channel));
        this.client.eventEmitter.on('_destroyChannel', () => {
            for (let key in this) {
                if (this.hasOwnProperty(key)) {
                    this[key] = null;
                    delete this[key];
                }
            }
        });
    }

    watch(fn: any) {
        this.client.channelsEmitter.on(this.channel, fn);
        return this;
    }

    publish(data: any) {
        this.client.webSocket.send(MessageFactory.publishMessage(this.channel, data));
        return this;
    }
}