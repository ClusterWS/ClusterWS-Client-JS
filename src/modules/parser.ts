import ClusterWSClient from '../index';
import { Message } from '../utils/types';

export function decode(socket: ClusterWSClient, data: Message): void {
  // handle all the stuff
  const [msgType, param, message]: [string, string, Message] = data;

  if (msgType === 'e') {
    return (socket as any).emitter.emit(param, message);
  }

  if (msgType === 'p') {
    const channels: string[] = Object.keys(message);
    for (let i: number = 0, len: number = channels.length; i < len; i++) {
      const channel: string = channels[i];
      const messages: Message[] = message[channel];
      for (let j: number = 0, msgLen: number = messages.length; j < msgLen; j++) {
        (socket as any).channels.channelNewMessage(channel, messages[j]);
      }
    }
  }

  if (msgType === 's') {
    if (param === 's') {
      const channels: string[] = Object.keys(message);
      for (let i: number = 0, len: number = channels.length; i < len; i++) {
        const channel: string = channels[i];
        (socket as any).channels.channelSetStatus(channel, message[channel]);
      }
    }

    if (param === 'c') {
      // handle configurations
    }
  }
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