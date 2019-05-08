import ClusterWSClient from '../index';
import { Message } from '../utils/types';

export function decode(socket: ClusterWSClient, data: Message): void {
  // handle all the stuff
  const [msgType, param, message]: [string, string, Message] = data;

  if (msgType === 'e') {
    return (socket as any).emitter.emit(param, message);
  }

  // TODO: add channels parsing
  // TODO: add system parsing
}

export function encode(event: string, data: Message, eventType: string): string {
  const message: { [key: string]: any } = {
    emit: ['e', event, data],
    publish: ['p', event, data],
    system: {
      subscribe: ['s', 's', data],
      unsubscribe: ['s', 'u', data],
      configuration: ['s', 'c', data]
    }
  };

  if (eventType === 'system') {
    return JSON.stringify(message[eventType][event]);
  }

  return JSON.stringify(message[eventType]);
}