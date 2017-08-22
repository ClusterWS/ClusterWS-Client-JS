import { Socket } from '../socket'
// u = unsubscribe
// s = subsrcibe

export class Channel {
    event: any

    constructor(public channel: string, public socket: Socket) {
        this.subscribe()
    }

    watch(fn: any) {
        this.event = fn
        return this
    }

    publish(data: any) {
        this.channel ? this.socket.send(this.channel, data, 'publish') : ''
        return this
    }

    message(data: any) {
        if (this.event) this.event(data)
    }

    unsubscribe() {
        this.socket.send('unsubscribe', this.channel, 'system')
        this.socket.channels[this.channel] = null
        for (let key in this) if (this.hasOwnProperty(key)) {
            this[key] = null
            delete this[key]
        }
    }

    subscribe() {
        this.socket.send('subscribe', this.channel, 'system')
    }
}