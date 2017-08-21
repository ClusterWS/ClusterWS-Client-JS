import { _ } from './utils/fp'
import { Options } from './options'
import { Channel } from './channel/channel'
import { EventEmitter } from './utils/eventemitter'
import { socketMessages } from './communication/messages'

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
        this.webSocket = null
        this.webSocket = new WebSocket('ws://' + this.options.url + ':' + this.options.port)

        this.webSocket.onerror = (err: any) => this.events.emit('error', err)

        this.webSocket.onopen = () => {
            clearInterval(interval)
            this.inReconnectionState = false
            this.reconnectionAttempted = 0

            _.map((channel: any) => channel.subscribe() ,this.channels)

            this.events.emit('connect')
        }

        this.webSocket.onmessage = (msg: any) => {
            if (msg.data === '#0') return this.send('#1', null, 'ping')

            msg = JSON.parse(msg.data)

            _.switchcase({
                'p': () => this.channels[msg.m[1]] ? this.channels[msg.m[1]].message(msg.m[2]) : '',
                'e': () => this.events.emit(msg.m[1], msg.m[2]),
                's': () => _.switchcase({
                    'c': () => { }
                })(msg.m[1])
            })(msg.m[0])
        }

        this.webSocket.onclose = (event: any) => {
            this.events.emit('disconnect', event.code, event.reason)
            
            if (this.autoReconnect && event.code !== 1000) return this.inReconnectionState ? '' : this.reconnection()

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


    reconnection() {
        this.inReconnectionState = true

        let interval = setInterval(() => {
            if (this.webSocket.readyState === this.webSocket.CLOSED) {
                this.reconnectionAttempted++
                this.connect(interval)
                if (this.options.reconnectionAttempts !== 0 && this.reconnectionAttempted >= this.options.reconnectionAttempts) {
                    clearInterval(interval)

                    this.autoReconnect = false
                    this.inReconnectionState = false
                }
            }
        }, this.options.reconnectionInterval)
    }
}