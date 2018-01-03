import ClusterWS from '../../index'

export function buffer(str: string): ByteString {
    const length: number = str.length
    const uint: any = new Uint8Array(length)
    for (let i: number = 0; i < length; i++) uint[i] = str.charCodeAt(i)
    return uint.buffer
}

export function decode(socket: ClusterWS, message: any): any {
    switch (message['#'][0]) {
        case 'e': return socket.events.emit(message['#'][1], message['#'][2])
        case 'p': socket.channels[message['#'][1]] && socket.channels[message['#'][1]].onMessage(message['#'][2])
        case 's':
            switch (message['#'][1]) {
                case 'c':
                    socket.pingInterval = setInterval((): void =>
                        socket.missedPing++ > 2 && socket.disconnect(4001, 'Did not get pings'), message['#'][2].ping)
                    socket.useBinary = message['#'][2].binary
                    socket.events.emit('connect')
                default: break
            }
        default: break
    }
}

export function encode(event: string, data: any, type: string): any {
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