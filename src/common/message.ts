import { ClusterWS } from '../index'

export function socketEncodeMessages(event: string, data: any, type: string): any {
    switch (type) {
        case 'ping': return event
        case 'emit': return JSON.stringify({ '#': ['e', event, data] })
        case 'publish': return JSON.stringify({ '#': ['p', event, data] })
        case 'system': switch (event) {
            case 'subscribe': return JSON.stringify({ '#': ['s', 's', data] })
            case 'unsubscribe': return JSON.stringify({ '#': ['s', 'u', data] })
            case 'configuration': return JSON.stringify({ '#': ['s', 'c', data] })
            default: break
        }
        default: break
    }
}

export function socketDecodeMessages(socket: ClusterWS, message: any): any {
    switch (message['#'][0]) {
        case 'e': return socket.events.emit(message['#'][1], message['#'][2])
        case 'p': return socket.channels[message['#'][1]] ? socket.channels[message['#'][1]].onMessage(message['#'][2]) : ''
        case 's': switch (message['#'][1]) {
            case 'c': socket.pingInterval = setInterval(() => socket.lost < 3 ? socket.lost++ : socket.disconnect(3001, 'Did not get pings'), message['#'][2].ping)
            default: break
        }
        default: break
    }
}