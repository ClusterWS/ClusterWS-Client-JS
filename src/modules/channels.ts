import ClusterWSClient from '../index';
import { Message, Listener } from '../utils/types';

// TODO: channel logic can be improved for better performance
// Single channel
export class Channel {
  public READY: number = 1;
  public status: number = 0;

  private events: any = {};

  constructor(private client: ClusterWSClient, public name: string, public listener: Listener) {
    this.client.send('subscribe', [this.name], 'system');
  }

  public on(event: string, listener: Listener): void {
    this.events[event] = listener;
  }

  public publish(message: Message): any {
    if (this.status === this.READY) {
      this.client.send(this.name, message, 'publish');
    }
  }

  // unsubscribe from the channel
  public unsubscribe(): any {
    this.status = 0;
    this.emit('unsubscribed');
    (this.client as any).channels.removeChannel(this.name);
    this.client.send('unsubscribe', this.name, 'system');
  }

  private emit(event: string): void {
    const listener: Listener = this.events[event];
    listener && listener();
  }
}

// Channels manager
export class Channels {
  private channels: { [key: string]: Channel } = {};

  constructor(private client: ClusterWSClient) { }

  public subscribe(channelName: string, listener: Listener): Channel {
    if (!this.channels[channelName]) {
      const channel: Channel = new Channel(this.client, channelName, listener);
      this.channels[channelName] = channel;
      return channel;
    }
  }

  public getChannelByName(channelName: string): Channel {
    return this.channels[channelName] || null;
  }

  // This is used internally when new message is received
  public channelNewMessage(channelName: string, message: any): void {
    const channel: Channel = this.channels[channelName];
    if (channel && channel.status === channel.READY) {
      channel.listener(message);
    }
  }

  // This is used internally when we get status for this channel from server
  public channelSetStatus(channelName: string, pass: boolean): void {
    const channel: Channel = this.channels[channelName];
    if (channel) {
      if (!pass) {
        // if subscription fail we delete event
        (channel as any).emit('canceled');
        return this.removeChannel(channelName);
      }
      channel.status = 1;
      (channel as any).emit('subscribed');
    }
  }

  public removeChannel(channelName: string): void {
    delete this.channels[channelName];
  }
}