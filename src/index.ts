import { logError } from './common/console'
import { EventEmitter } from './common/emitter'
import { Options, UserOptions } from './common/interfaces'
import { socketEncodeMessages, socketDecodeMessages } from './common/message'
import { Channel } from './modules/channel'
import { Reconnect } from './modules/reconnect'

export class ClusterWS {
    events: EventEmitter
    options: Options
    channels: any
    websocket: WebSocket

    lost: number
    pingInterval: any

    reconnection: Reconnect

    constructor(configurations: UserOptions) {
        if (!configurations.url) {
            logError('Url must be provided')
            return
        }

        if (!configurations.port) {
            logError('Port must be provided')
            return
        }

        this.options = {
            url: configurations.url,
            port: configurations.port,
            autoReconnect: configurations.autoReconnect || false,
            reconnectionInterval: configurations.reconnectionInterval || 5000,
            reconnectionAttempts: configurations.reconnectionAttempts || 0
        }

        this.lost = 0
        this.events = new EventEmitter()
        this.channels = {}
        this.reconnection = new Reconnect(this)
        this.create()
    }

    create(): void {
        this.websocket = new WebSocket('ws://' + this.options.url + ':' + this.options.port)

        this.websocket.onopen = (): void => {
            this.reconnection.isConnected()
            this.events.emit('connect')
        }

        this.websocket.onmessage = (message: any): any => {
            if (message.data === '#0') return this.lost = 0

            try {
                message = JSON.parse(message.data)
            } catch (e) { return logError(e) }

            socketDecodeMessages(this, message)
        }

        this.websocket.onclose = (event: any): void => {
            clearInterval(this.pingInterval)
            this.events.emit('disconnect', event.code, event.reason)


            if (this.reconnection.inReconnectionState) return
            if (this.options.autoReconnect && event.code !== 1000) {
                return this.reconnection.reconnect()
            }

            this.events.removeAllEvents()
            for (const key in this) {
                if (this.hasOwnProperty(key)) delete this[key]
            }
        }
        this.websocket.onerror = (): void => this.events.emit('error')
    }

    on(event: string, listener: any): void {
        this.events.on(event, listener)
    }

    send(event: string, data: any, type?: string): void {
        this.websocket.send(socketEncodeMessages(event, data, type || 'emit'))
    }

    disconnect(code?: number, msg?: any): void {
        this.websocket.close(code || 1000, msg)
    }

    subscribe(channel: string): void {
        return this.channels[channel] ? this.channels[channel] : this.channels[channel] = new Channel(channel, this)
    }

    getState(): any {
        return this.websocket.readyState
    }
}