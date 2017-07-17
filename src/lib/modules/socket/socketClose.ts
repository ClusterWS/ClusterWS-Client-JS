import { ClusterWS } from '../../../index'
import { socketReconnect } from './socketReconnect';

export function socketClose(self: any) {
    self.webSocket.onclose = (code?: number, msg?: any) => {
        self.eventEmitter.emit('disconnect', code, msg);

        clearInterval(self.pingTimeOut);

        if (!self.autoReconnect || code === 1000) {
            self.eventEmitter.removeAllEvents();

            for (let key in self.channels) {
                if (self.channels.hasOwnProperty(key)) {
                    self.channels[key] = null;
                    delete self.channels[key];
                }
            }

            for (let key in self) {
                if (self.hasOwnProperty(key)) {
                    self[key] = null;
                    delete self[key];
                }
            }
        } else if (!self.inReconnectState) {
            socketReconnect(self);
        }
    };
}