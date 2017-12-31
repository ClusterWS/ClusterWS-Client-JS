import ClusterWS from '../index'
import { TListener, logError } from '../utils/utils'

export class Channel {
    private listener: TListener

    constructor(private socket: ClusterWS, private channel: string) {
        this.subscribe()
    }

    public watch(listener: TListener): Channel {
        if ({}.toString.call(listener) !== '[object Function]') return logError('Listener must be a function')
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