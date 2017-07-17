import { ClusterWS } from '../../../index'

export function socketReconnect(self: ClusterWS) {
    self.inReconnectState = true;
    self.reconnectInterval = setInterval(() => {
        if (self.webSocket.readyState === self.webSocket.CLOSED) {
            self.reconnectAttempts++;
            self.connect();
            if (self.options.reconnectAttempts !== 0) {
                if (self.reconnectAttempts >= self.options.reconnectAttempts) {
                    self.autoReconnect = false;
                    return clearInterval(self.reconnectInterval)
                }
            }
        }
    }, self.options.reconnectInterval);
};

export function socketSuccessfulReconnection(self: ClusterWS) {
    self.reconnectAttempts = 0;
    self.inReconnectState = false;
    clearInterval(self.reconnectInterval);

    for (let key in self.channels) {
        if (self.channels.hasOwnProperty(key)) {
            self.channels[key]._subscribe();
        }
    }
}
