import { Options } from '../common/interfaces'
import { ClusterWS } from '../index'

export class Reconnect {
    autoReconnect: boolean
    inReconnectionState: boolean
    reconnectionAttempted: number
    interval: any
    timer: any

    constructor(public socket: ClusterWS) {
        this.autoReconnect = this.socket.options.autoReconnect
        this.inReconnectionState = false
        this.reconnectionAttempted = 0
    }

    isConnected(): void {
        console.log('here')
        clearTimeout(this.timer)
        clearInterval(this.interval)
        this.inReconnectionState = false
        this.reconnectionAttempted = 0

        for (let i: number = 0, len: number = this.socket.channels.lenght; i < len; i++) {
            this.socket.channels[i].subscribe()
        }
    }

    reconnect(): void {
        this.inReconnectionState = true
        this.interval = setInterval(() => {
            console.log('reconnect')

            if (this.socket.websocket.readyState === this.socket.websocket.CLOSED) {
                this.reconnectionAttempted++
                if (this.socket.options.reconnectionAttempts !== 0 && this.reconnectionAttempted >= this.socket.options.reconnectionAttempts) {
                    clearInterval(this.interval)
                    this.autoReconnect = false
                    this.inReconnectionState = false
                }
                
                clearTimeout(this.timer)
                this.timer = setTimeout(() => {
                    this.socket.create()
                }, Math.floor(Math.random() * (1000 + 1)))
            }
        }, this.socket.options.reconnectionInterval)
    }
}