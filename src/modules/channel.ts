import { ClusterWS } from '../index'

export class Channel {
    listener: any
    constructor(public channel: string, public socket: ClusterWS) {
        this.subscribe()
    }

    watch(listener: any): Channel {
        this.listener = listener
        return this
    }

    publish(data: any): Channel {
        this.socket.send(this.channel, data, 'publish')
        return this
    }

    unsubscribe(): void {
        this.socket.send('unsubscribe', this.channel, 'system')
        this.socket.channels[this.channel] = null
    }

    onMessage(data: any): void {
        if (this.listener) this.listener.call(null, data)
    }

    subscribe(): void {
        this.socket.send('subscribe', this.channel, 'system')
    }
}