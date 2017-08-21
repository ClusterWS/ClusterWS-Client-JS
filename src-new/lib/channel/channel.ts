// u = unsubscribe
// s = subsrcibe

export class Channel {
    event: any

    constructor(public channel: string, public socket: any) {
        this.subscribe()
    }

    watch(fn: any) {
        this.event = fn
        return this
    }

    publish(data: any) {
        this.socket.send(this.channel, data, 'publish')
        return this
    }

    message(data: any) {
        if (this.event) this.event(data)
    }

    unsubscribe() {
        this.socket.send('unsubscribe', this.channel, 'system')
    }

    subscribe() {
        this.socket.send('subscribe', this.channel, 'system')
    }
}