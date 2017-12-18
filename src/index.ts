import { Channel } from './modules/channel'
import { EventEmitter } from './utils/emitter'
import { Reconnection } from './modules/reconnection'
import { IObject, TSocketMessage, TListener, IUserOptions, IOptions, logError } from './utils/utils'

declare const window: any

export class ClusterWS {
    private static buffer(str: string): ByteString {
        const length: number = str.length
        const uint: any = new Uint8Array(length)
        for (let i: number = 0; i < length; i++) uint[i] = str.charCodeAt(i)
        return uint.buffer
    }

    private static decode(socket: ClusterWS, message: TSocketMessage): any {
        switch (message['#'][0]) {
            case 'e': return socket.events.emit(message['#'][1], message['#'][2])
            case 'p': return socket.channels[message['#'][1]] ? socket.channels[message['#'][1]].onMessage(message['#'][2]) : ''
            case 's':
                switch (message['#'][1]) {
                    case 'c':
                        socket.pingInterval = setInterval((): void | string => socket.missedPing++ > 2 ? socket.disconnect(4001, 'Did not get pings') : '', message['#'][2].ping)
                        socket.useBinary = message['#'][2].binary
                        socket.events.emit('connect')
                    default: break
                }
            default: break
        }
    }

    private static encode(event: string, data: any, type: string): any {
        switch (type) {
            case 'ping': return event
            case 'emit': return JSON.stringify({ '#': ['e', event, data] })
            case 'publish': return JSON.stringify({ '#': ['p', event, data] })
            case 'system': switch (event) {
                case 'subscribe': return JSON.stringify({ '#': ['s', 's', data] })
                case 'unsubscribe': return JSON.stringify({ '#': ['s', 'u', data] })
                case 'configuration': return JSON.stringify({ '#': ['s', 'c', data] })
                default: break
            }
            default: break
        }
    }

    public options: IOptions
    public channels: IObject = {}
    public websocket: WebSocket
    private missedPing: number = 0
    private events: EventEmitter = new EventEmitter()
    private useBinary: boolean = false
    private pingInterval: number
    private reconnection: Reconnection

    constructor(configuration: IUserOptions) {
        if (!configuration.url || typeof configuration.url !== 'string')
            return logError('Url must be provided and it must be string')

        this.options = {
            url: configuration.url,
            autoReconnect: configuration.autoReconnect || false,
            reconnectionIntervalMin: configuration.reconnectionIntervalMin || 1000,
            reconnectionIntervalMax: configuration.reconnectionIntervalMax || 5000,
            reconnectionAttempts: configuration.reconnectionAttempts || 0
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
        this.websocket.onerror = (err: TSocketMessage): void => this.events.emit('error', err.message)
        this.websocket.onmessage = (message: TSocketMessage): void => {
            let data: string = message.data
            if (this.useBinary && typeof data !== 'string') data = String.fromCharCode.apply(null, new Uint8Array(data))
            if (data === '#0') {
                this.missedPing = 0
                return this.send('#1', null, 'ping')
            }
            try { data = JSON.parse(data) } catch (e) { return logError(e) }
            ClusterWS.decode(this, data)
        }
        this.websocket.onclose = (event: CloseEvent): void => {
            this.missedPing = 0
            clearInterval(this.pingInterval)
            this.events.emit('disconnect', event.code, event.reason)

            if (this.reconnection.inReconnectionState) return
            if (this.options.autoReconnect && event.code !== 1000) return this.reconnection.reconnect()

            this.events.removeAllEvents()
            for (const key in this) this.hasOwnProperty(key) ? delete this[key] : ''
        }
    }

    public on(event: string, listener: TListener): void {
        this.events.on(event, listener)
    }

    public send(event: string, data: any, type: string = 'emit'): void {
        this.websocket.send(this.useBinary ? ClusterWS.buffer(ClusterWS.encode(event, data, type)) : ClusterWS.encode(event, data, type))
    }

    public disconnect(code?: number, msg?: any): void {
        this.websocket.close(code || 1000, msg)
    }

    public getState(): number {
        return this.websocket.readyState
    }

    public subscribe(channel: string): void {
        return this.channels[channel] ? this.channels[channel] : this.channels[channel] = new Channel(this, channel)
    }

    public getChannelByName(channelName: string): Channel {
        return this.channels[channelName]
    }
}