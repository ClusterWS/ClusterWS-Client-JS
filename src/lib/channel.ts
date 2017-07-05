import {ClusterWS} from '../index';
import {MessageFactory} from './messages/messages';
export class Channel {
    constructor(public channel:string, public client: ClusterWS) {}
    on(fn){
       this.client.channels[this.channel] = fn;
    }
    publish(data){
        this.client.send(MessageFactory.publishMessage(this.channel, data));
    }
}