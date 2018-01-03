import ClusterWS from '../../index'
import { Listener, logError } from '../../utils/utils'

export class Channel {
    private listener: Listener

    constructor(private socket: ClusterWS, public name: string) {
        this.subscribe()
    }

    public watch(listener: Listener): Channel {
        if ({}.toString.call(listener) !== '[object Function]')
            return logError('Listener must be a function')
        this.listener = listener
        return this
    }

    public publish(data: any): Channel {
        this.socket.send(this.name, data, 'publish')
        return this
    }

    public unsubscribe(): void {
        this.socket.send('unsubscribe', this.name, 'system')
        this.socket.channels[this.name] = null
    }

    public onMessage(data: any): void {
        this.listener && this.listener.call(null, data)
    }

    public subscribe(): void {
        this.socket.send('subscribe', this.name, 'system')
    }
}