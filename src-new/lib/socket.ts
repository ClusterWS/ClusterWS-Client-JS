import { _ } from './utils/fp'
import { Options } from './options'
import { EventEmitter } from './utils/eventemitter'
import { socketMessages } from './communication/messages'


export class Socket {
    events: EventEmitter = new EventEmitter()
    webSocket: any

    constructor(public options: Options) { }

    connect() {
        this.webSocket = null
        this.webSocket = new WebSocket('ws://' + this.options.url + ':' + this.options.port)

        this.webSocket.onopen = () => this.events.emit('connect')
        this.webSocket.onerror = (err: any) => this.events.emit('error', err)
        this.webSocket.onmessage = (msg: any) => {
            msg === '#0' ? this.send('#1', null, 'ping') : msg = JSON.parse(msg)
            _.switchcase({
                'p': () => { },
                'e': () => this.events.emit(msg.m[1], msg.m[2]),
                's': () => _.switchcase({
                    'c': () => { }
                })(msg.m[1])
            })(msg.m[0])
        }
        this.webSocket.onclose = () => {

        }

    }

    on(event: string, fn: any) {
        this.events.on(event, fn)
    }

    send(event: string, data: any, type?: string) {
        this.webSocket.send(socketMessages(event, data, type || 'emit'))
    }

}