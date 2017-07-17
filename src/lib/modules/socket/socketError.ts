import { ClusterWS } from '../../../index'

export function socketError(self: ClusterWS) {
    self.webSocket.onerror = (msg: any) => {
        self.eventEmitter.emit('error', msg);
    };
}