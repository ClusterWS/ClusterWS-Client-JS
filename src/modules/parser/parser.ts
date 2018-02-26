import ClusterWS from '../../index'
import { CustomObject } from '../../utils/interfaces'


export function buffer(str: string): ByteString {
    const length: number = str.length
    const uint: any = new Uint8Array(length)
    for (let i: number = 0; i < length; i++) uint[i] = str.charCodeAt(i)
    return uint.buffer
}

export function decode(socket: ClusterWS, message: any) {
    const actions: CustomObject = {
        'e': (): void => socket.events.emit(message['#'][1], message['#'][2]),
        'p': (): void => socket.channels[message['#'][1]] && socket.channels[message['#'][1]].onMessage(message['#'][2]),
        's': {
            'c': (): void => {
                socket.pingInterval = setInterval((): void =>
                    socket.missedPing++ > 2 && socket.disconnect(4001, 'Did not get pings'), message['#'][2].ping)
                socket.useBinary = message['#'][2].binary
                socket.events.emit('connect')
            }
        }
    }

    return message['#'][0] === 's' ?
        actions[message['#'][0]][message['#'][1]] && actions[message['#'][0]][message['#'][1]].call(null) :
        actions[message['#'][0]] && actions[message['#'][0]].call(null)
}

export function encode(event: string, data: any, type: string): string {
    const message: CustomObject = {
        'emit': { '#': ['e', event, data] },
        'publish': { '#': ['p', event, data] },
        'system': {
            'subscribe': { '#': ['s', 's', data] },
            'unsubscribe': { '#': ['s', 'u', data] }
        }
    }

    return type === 'ping' ? event :
        JSON.stringify(type === 'system' ?
            message[type][event] : message[type])
}