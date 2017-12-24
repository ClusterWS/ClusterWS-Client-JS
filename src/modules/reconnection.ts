import { ClusterWS } from '../index'

export class Reconnection {
    public inReconnectionState: boolean = false
    private reconnectionAttempted: number = 0
    private autoReconnect: boolean
    private interval: NodeJS.Timer
    private timer: NodeJS.Timer

    constructor(public socket: ClusterWS) {
        this.autoReconnect = this.socket.options.autoReconnect
    }

    public isConnected(): void {
        clearTimeout(this.timer)
        clearInterval(this.interval)

        this.inReconnectionState = false
        this.reconnectionAttempted = 0

        for (const key in this.socket.channels) this.socket.channels[key] ? this.socket.channels[key].subscribe() : null
    }

    public reconnect(): void {
        this.inReconnectionState = true
        this.interval = setInterval((): void => {
            if (this.socket.getState() === this.socket.websocket.CLOSED) {
                this.reconnectionAttempted++
                if (this.socket.options.reconnectionAttempts !== 0 && this.reconnectionAttempted >= this.socket.options.reconnectionAttempts) {
                    clearInterval(this.interval)
                    this.autoReconnect = false
                    this.inReconnectionState = false
                }
                clearTimeout(this.timer)
                this.timer = setTimeout((): void => this.socket.create(), Math.floor(Math.random() * (this.socket.options.reconnectionIntervalMax - this.socket.options.reconnectionIntervalMin + 1)))
            }
        }, this.socket.options.reconnectionIntervalMin)
    }
}