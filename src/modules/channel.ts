import { ClusterWS } from '../index'

export class Channel {
    private listener: any

    constructor(public channel: string, public socket: ClusterWS) {
        this.subscribe()
    }

    public watch(listener: any): Channel {
        this.listener = listener
        return this
    }

    public publish(data: any): Channel {
        this.socket.send(this.channel, data, 'publish')
        return this
    }

    public unsubscribe(): void {
        this.socket.send('unsubscribe', this.channel, 'system')
        this.socket.channels[this.channel] = null
    }

    public onMessage(data: any): void {
        if (this.listener) this.listener.call(null, data)
    }

    public subscribe(): void {
        this.socket.send('subscribe', this.channel, 'system')
    }
}