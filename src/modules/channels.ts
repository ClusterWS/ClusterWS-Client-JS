import ClusterWSClient from '../index';
import { Message, Listener } from '../utils/types';

// TODO: channel logic can be improved for better performance
// Single channel
export class Channel {
  public READY: number = 1;
  public status: number = 0;

  private events: any = {};
  private watchers: any[] = [];

  constructor(private client: ClusterWSClient, public name: string) {
    if (this.client.readyState === this.client.OPEN) {
      this.client.send('subscribe', [this.name], 'system');
    }
  }

  public on(event: string, listener: Listener): void {
    this.events[event] = listener;
  }

  public publish(message: Message): void {
    if (this.status === this.READY) {
      this.client.send(this.name, message, 'publish');
    }
  }

  public setWatcher(listener: Listener): void {
    this.watchers.push(listener);
  }

  public removeWatcher(listener: Listener): void {
    for (let i: number = 0, len: number = this.watchers.length; i < len; i++) {
      if (this.watchers[i] === listener) {
        this.watchers.splice(i, 1);
        break;
      }
    }
  }

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

  private broadcast(message: Message): void {
    for (let i: number = 0, len: number = this.watchers.length; i < len; i++) {
      this.watchers[i](message);
    }
  }
}

// Channels manager
export class Channels {
  private channels: { [key: string]: Channel } = {};

  constructor(private client: ClusterWSClient) { }

  public subscribe(channelName: string): Channel {
    if (!this.channels[channelName]) {
      const channel: Channel = new Channel(this.client, channelName);
      this.channels[channelName] = channel;
      return channel;
    }
  }

  public resubscribe(): void {
    const allChannels: string[] = Object.keys(this.channels);
    if (allChannels.length) {
      this.client.send('subscribe', allChannels, 'system');
    }
  }

  public getChannelByName(channelName: string): Channel {
    return this.channels[channelName] || null;
  }

  // This is used internally when new message is received
  public channelNewMessage(channelName: string, message: Message): void {
    const channel: Channel = this.channels[channelName];
    if (channel && channel.status === channel.READY) {
      (channel as any).broadcast(message);
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

  public removeAllChannels(): void {
    this.channels = {};
  }
}