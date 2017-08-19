import { socketMessages } from '../communication/messages'

// u = unsubscribe
// s = subsrcibe

export class Channel {
    event: any

    constructor(public channel: string, public send: any) {
        this.subscribe()
    }

    watch(fn: any) {
        this.event = fn
        return this
    }

    publish(data: any) {
        this.send(socketMessages(this.channel, data, 'publish'))
        return this
    }

    unsubscribe() {
        this.send(socketMessages('unsubscribe', this.channel, 'system'))
    }

    subscribe() {
        this.send(socketMessages('subscribe', this.channel, 'system'))
    }
}