import { ClusterWS } from '../../../index'

export function socketMessage(self: ClusterWS) {
    self.webSocket.onmessage = (msg: any) => {

        if (msg.data === '_0') {
            self.missedPing = 0;
            return self.send('_1', null , 'pong');
        }

        try {
            msg = JSON.parse(msg.data);
        } catch (e) {
            return self.disconnect(1007);
        }

        switch (msg.action) {
            case 'emit':
                self.eventEmitter.emit(msg.event, msg.data);
                break;
            case 'publish':
                self.channels[msg.channel]._message(msg.data);
                break;
            case 'internal':
                if (msg.event === 'config') {
                    self.pingTimeOut = setInterval(() => {
                        if (self.missedPing > 2) {
                            return self.disconnect(3001, 'Did not get ping');
                        }
                        return self.missedPing++;
                    }, msg.data.pingInterval);
                }
                break;
            default:
                break;
        }
    }
}