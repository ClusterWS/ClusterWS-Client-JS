import { _ } from './utils/fp'
import { Options } from './options'
import { Channel } from './channel/channel'
import { EventEmitter } from './utils/eventemitter'
import { socketMessages } from './communication/messages'

/* 
Socket object
Contains all available to the user socket functions 
*/
export class Socket {

    events: EventEmitter = new EventEmitter()
    channels: any = {}
    webSocket: any

    // Reconection variables
    autoReconnect: boolean = false
    inReconnectionState: boolean = false
    reconnectionAttempted: number = 0

    constructor(public options: Options) {
        this.autoReconnect = this.options.autoReconnect
        this.connect()
    }

    connect(interval?: any) {
        let pings: number = 0
        let pingInterval: any

        this.webSocket = new WebSocket('ws://' + this.options.url + ':' + this.options.port)

        this.webSocket.onerror = (err: any) => this.events.emit('error', err)

        this.webSocket.onopen = () => {
            clearInterval(interval)
            this.inReconnectionState = false
            this.reconnectionAttempted = 0

            _.map((channel: any) => channel._subscribe(), this.channels)

            this.events.emit('connect')
        }

        this.webSocket.onmessage = (msg: any) => {
            if (msg.data === '#0') {
                pings = 0
                return this.send('#1', null, 'ping')
            }

            msg = JSON.parse(msg.data)

            _.switchcase({
                'p': () => this.channels[msg.m[1]] ? this.channels[msg.m[1]]._message(msg.m[2]) : '',
                'e': () => this.events.emit(msg.m[1], msg.m[2]),
                's': () => _.switchcase({
                    'c': () => pingInterval = setInterval(() => pings < 3 ? pings++ : this.webSocket.disconnect(3001, 'No pings from server'), msg.m[2].ping)
                })(msg.m[1])
            })(msg.m[0])
        }

        this.webSocket.onclose = (event: any) => {
            clearInterval(pingInterval)
            this.events.emit('disconnect', event.code, event.reason)

            if (this.autoReconnect && event.code !== 1000) return this.inReconnectionState ? '' : this._reconnection()

            this.events.removeAllEvents()
            for (let key in this) if (this.hasOwnProperty(key)) {
                this[key] = null
                delete this[key]
            }
        }
    }

    subscribe(channel: string) {
        return this.channels[channel] ? this.channels[channel] : this.channels[channel] = new Channel(channel, this)
    }

    disconnect(code?: number, msg?: any) {
        this.webSocket.close(code || 1000, msg)
    }

    on(event: string, fn: any) {
        this.events.on(event, fn)
    }

    send(event: string, data: any, type?: string) {
        this.webSocket.send(socketMessages(event, data, type || 'emit'))
    }

    getState() {
        return this.webSocket.readyState
    }

    _reconnection() {
        this.inReconnectionState = true

        let interval = setInterval(() => {
            if (this.webSocket.readyState === this.webSocket.CLOSED) {
                this.reconnectionAttempted++
                if (this.options.reconnectionAttempts !== 0 && this.reconnectionAttempted >= this.options.reconnectionAttempts) {
                    clearInterval(interval)
                    this.autoReconnect = false
                    this.inReconnectionState = false
                }
                this.connect(interval)
            }
        }, this.options.reconnectionInterval)
    }
}