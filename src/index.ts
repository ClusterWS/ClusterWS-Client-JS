import { Channel } from './modules/channel/channel'
import { EventEmitter } from './modules/emitter/emitter'
import { Reconnection } from './modules/reconnection/reconnection'
import { buffer, decode, encode } from './modules/parser/parser'
import { Options, Configurations, logError, Listener, CustomObject } from './utils/utils'

declare const window: any

export default class ClusterWS {
    public options: Options
    public websocket: WebSocket
    public channels: CustomObject = {}

    public events: EventEmitter = new EventEmitter()
    public missedPing: number = 0
    public useBinary: boolean = false
    public pingInterval: any

    private reconnection: Reconnection

    constructor(configurations: Configurations) {
        if (!configurations.url)
            return logError('Url must be provided and it must be string')

        this.options = {
            url: configurations.url,
            autoReconnect: configurations.autoReconnect || false,
            reconnectionAttempts: configurations.reconnectionAttempts || 0,
            reconnectionIntervalMin: configurations.reconnectionIntervalMin || 1000,
            reconnectionIntervalMax: configurations.reconnectionIntervalMax || 5000
        }

        if (this.options.reconnectionIntervalMin > this.options.reconnectionIntervalMax)
            return logError('reconnectionIntervalMin can not be more then reconnectionIntervalMax')

        this.reconnection = new Reconnection(this)
        this.create()
    }

    public create(): void {
        const Socket: any = window.MozWebSocket || window.WebSocket

        this.websocket = new Socket(this.options.url)
        this.websocket.binaryType = 'arraybuffer'
        this.websocket.onopen = (): void => this.reconnection.isConnected()
        this.websocket.onerror = (err: any): void => this.events.emit('error', err.message)
        this.websocket.onmessage = (message: any): void => {
            let data: string = typeof message.data !== 'string' ?
                String.fromCharCode.apply(null, new Uint8Array(message.data)) : message.data

            if (data === '#0') {
                this.missedPing = 0
                return this.send('#1', null, 'ping')
            } else try {
                data = JSON.parse(data)
            } catch (e) { return logError(e) }

            decode(this, data)
        }
        this.websocket.onclose = (event: CloseEvent): void => {
            this.missedPing = 0
            clearInterval(this.pingInterval)
            this.events.emit('disconnect', event.code, event.reason)

            if (this.options.autoReconnect && event.code !== 1000) return this.reconnection.reconnect()

            this.events.removeAllEvents()
            for (const key in this)
                this[key] ? this[key] = null : null
        }
    }

    public on(event: string, listener: Listener): void {
        this.events.on(event, listener)
    }

    public send(event: string, data: any, type: string = 'emit'): void {
        this.websocket.send(this.useBinary ?
            buffer(encode(event, data, type)) :
            encode(event, data, type))
    }

    public disconnect(code?: number, msg?: any): void {
        this.websocket.close(code || 1000, msg)
    }

    public getState(): number {
        return this.websocket.readyState
    }

    public subscribe(channelName: string): Channel {
        return this.channels[channelName] ? this.channels[channelName] :
            this.channels[channelName] = new Channel(this, channelName)
    }

    public getChannelByName(channelName: string): Channel {
        return this.channels[channelName]
    }
}

module.exports = ClusterWS
module.exports.default = ClusterWS