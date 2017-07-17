import { ClusterWS } from '../../../index'
import { socketSuccessfulReconnection } from './socketReconnect';

export function socketOpen(self: ClusterWS) {
    self.webSocket.onopen = (msg: any) => {
        socketSuccessfulReconnection(self);
        self.eventEmitter.emit('connect', msg);
    };
};