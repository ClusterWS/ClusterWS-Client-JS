import { Channel } from './modules/channel'
import { logError } from './utils/logs'
import { EventEmitter } from './utils/emitter'
import { Reconnection } from './modules/reconnection'
import { IOptions, IPassedOptions } from './utils/interfaces'
import { socketDecodeMessages, socketEncodeMessages } from './modules/messages'

export class ClusterWS {
    private static getBuffer(str: string): any {
        const uint: any = new Uint8Array(str.length)
        for (let i: number = 0, strLen: number = str.length; i < strLen; i++) uint[i] = str.charCodeAt(i)
        return uint.buffer
    }

    public websocket: WebSocket
    public options: IOptions
    public pingInterval: any
    public channels: any = {}
    public events: EventEmitter = new EventEmitter()
    public missedPing: number = 0
    public useBinary: boolean = false
    private reconnection: Reconnection

    constructor(configurations: IPassedOptions) {
        if (!configurations.url || typeof configurations.url !== 'string')
            return logError('Url must be provided and it must be string')
        if (!configurations.port || typeof configurations.port !== 'number')
            return logError('Port must be provided and it must be number')

        this.options = {
            url: configurations.url,
            port: configurations.port,
            autoReconnect: configurations.autoReconnect || false,
            reconnectionIntervalMin: configurations.reconnectionIntervalMin || 1000,
            reconnectionIntervalMax: configurations.reconnectionIntervalMax || 5000,
            reconnectionAttempts: configurations.reconnectionAttempts || 0
        }

        if (this.options.reconnectionIntervalMin > this.options.reconnectionIntervalMax)
            return logError('reconnectionIntervalMin can not be more then reconnectionIntervalMax')

        this.reconnection = new Reconnection(this)
        this.create()
    }

    public create(): void {
        this.websocket = new WebSocket('ws://' + this.options.url + ':' + this.options.port)
        this.websocket.binaryType = 'arraybuffer'
        this.websocket.onopen = (): void => this.reconnection.isConnected()
        this.websocket.onerror = (): void => this.events.emit('error')

        this.websocket.onmessage = (message: any): any => {
            message = message.data
            if (this.useBinary && typeof message !== 'string') message = String.fromCharCode.apply(null, new Uint8Array(message))
            if (message === '#0') {
                this.send('#1', null, 'ping')
                return this.missedPing = 0
            }

            try {
                message = JSON.parse(message)
            } catch (e) { return logError(e) }

            socketDecodeMessages(this, message)
        }

        this.websocket.onclose = (event: any): void => {
            this.missedPing = 0
            clearInterval(this.pingInterval)
            this.events.emit('disconnect', event.code, event.reason)

            if (this.reconnection.inReconnectionState) return
            if (this.options.autoReconnect && event.code !== 1000) return this.reconnection.reconnect()

            this.events.removeAllEvents()
            for (const key in this) this.hasOwnProperty(key) ? delete this[key] : ''
        }
    }

    public on(event: string, listener: any): void {
        this.events.on(event, listener)
    }

    public send(event: string, data: any, type?: string): void {
        if (this.useBinary) return this.websocket.send(ClusterWS.getBuffer(socketEncodeMessages(event, data, type || 'emit')))
        this.websocket.send(socketEncodeMessages(event, data, type || 'emit'))
    }

    public disconnect(code?: number, msg?: any): void {
        this.websocket.close(code || 1000, msg)
    }

    public getState(): any {
        return this.websocket.readyState
    }

    public subscribe(channel: string): void {
        return this.channels[channel] ? this.channels[channel] : this.channels[channel] = new Channel(channel, this)
    }

    public getChannelByName(channelName: string): Channel {
        return this.channels[channelName]
    }
}