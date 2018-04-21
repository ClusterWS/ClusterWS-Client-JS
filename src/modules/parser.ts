import ClusterWS from '../index'
import { CustomObject, Message } from '../utils/types'

export function decode(socket: ClusterWS, message: Message): void {
  const userMessage: Message = socket.options.encodeDecodeEngine ?
    socket.options.encodeDecodeEngine.decode(message['#'][2]) : message['#'][2]

  const actions: CustomObject = {
    e: (): void => socket.events.emit(message['#'][1], userMessage),
    p: (): void => socket.channels[message['#'][1]] && socket.channels[message['#'][1]].onMessage(userMessage),
    s: {
      c: (): void => {
        socket.useBinary = userMessage.binary
        socket.resetPing(userMessage.ping)
        socket.events.emit('connect')
      }
    }
  }

  return message['#'][0] === 's' ?
    actions[message['#'][0]][message['#'][1]] && actions[message['#'][0]][message['#'][1]]() :
    actions[message['#'][0]] && actions[message['#'][0]]()
}

export function encode(event: string, data: Message, eventType: string): string {
  const message: CustomObject = {
    emit: { '#': ['e', event, data] },
    publish: { '#': ['p', event, data] },
    system: {
      subscribe: { '#': ['s', 's', data] },
      unsubscribe: { '#': ['s', 'u', data] }
    }
  }

  return JSON.stringify(eventType === 'system' ?
    message[eventType][event] : message[eventType])
}