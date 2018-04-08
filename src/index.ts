import { Channel } from './modules/channel'
import { logError } from './utils/functions'
import { EventEmitter } from './modules/emitter'
import { decode, encode, buffer } from './modules/parser'
import { Options, Configurations, Listener, CustomObject, Message } from './utils/types'

declare const window: any

export default class ClusterWS {
  public events: EventEmitter = new EventEmitter()
  public isAlive: boolean = true
  public channels: CustomObject = {}
  public useBinary: boolean = false
  public pingTimeout: any
  public pingInterval: any

  private options: Options
  private websocket: WebSocket
  private reconnectionAttempted: number = 0

  constructor(configurations: Configurations) {
    if (!configurations.url)
      return logError('Url must be provided and it must be a string')

    this.options = {
      url: configurations.url,
      autoReconnect: configurations.autoReconnect || false,
      autoReconnectOptions: configurations.autoReconnectOptions ? {
        attempts: configurations.autoReconnectOptions.attempts || 0,
        minInterval: configurations.autoReconnectOptions.minInterval || 1000,
        maxInterval: configurations.autoReconnectOptions.maxInterval || 5000
      } : { attempts: 0, minInterval: 1000, maxInterval: 5000 }
    }

    if (this.options.autoReconnectOptions.minInterval > this.options.autoReconnectOptions.maxInterval)
      return logError('minInterval option can not be more than maxInterval option')

    this.create()
  }
  public send(event: string, message: Message, eventType: string = 'emit'): void {
    this.websocket.send(this.useBinary ?
      buffer(encode(event, message, eventType)) :
      encode(event, message, eventType))
  }

  public on(event: 'error', listener: (err: any) => void): void
  public on(event: 'connect', listener: () => void): void
  public on(event: 'disconnect', listener: (code?: number, reason?: string) => void): void
  public on(event: string, listener: Listener): void
  public on(event: string, listener: Listener): void {
    this.events.on(event, listener)
  }

  public disconnect(code?: number, reason?: string): void {
    this.websocket.close(code || 1000, reason)
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

  public ping(): void {
    clearTimeout(this.pingTimeout)
    this.pingTimeout = setTimeout(() => this.disconnect(4001, 'Did not get pings'), this.pingInterval * 2)
  }

  private create(): void {
    const Socket: any = window.MozWebSocket || window.WebSocket

    this.websocket = new Socket(this.options.url)
    this.websocket.binaryType = 'arraybuffer'

    this.websocket.onopen = (): void => {
      this.reconnectionAttempted = 0
      for (let i: number = 0, keys: string[] = Object.keys(this.channels), keysLength: number = keys.length; i < keysLength; i++)
        this.channels[keys[i]] && this.channels[keys[i]].subscribe()
    }
    this.websocket.onclose = (event: CloseEvent): void => {
      clearTimeout(this.pingTimeout)
      this.events.emit('disconnect', event.code, event.reason)

      if (this.options.autoReconnect && event.code !== 1000 &&
        (this.options.autoReconnectOptions.attempts === 0 || this.reconnectionAttempted < this.options.autoReconnectOptions.attempts)) {
        if (this.websocket.readyState === this.websocket.CLOSED) {
          this.reconnectionAttempted++
          this.websocket = undefined
          setTimeout(() => this.create(), Math.floor(Math.random() * (this.options.autoReconnectOptions.maxInterval - this.options.autoReconnectOptions.minInterval + 1)))
        } else console.log('Some thing wrong with close event please contact developer')
      } else {
        this.events.removeAllEvents()
        for (let i: number = 0, keys: string[] = Object.keys(this), keysLength: number = keys.length; i < keysLength; i++)
          this[keys[i]] = null
      }
    }
    this.websocket.onmessage = (message: Message): void => {
      let data: string = typeof message.data !== 'string' ?
        String.fromCharCode.apply(null, new Uint8Array(message.data)) : message.data

      if (data === '9') {
        this.websocket.send(buffer('A'))
        return this.ping()
      }

      try {
        data = JSON.parse(data)
        decode(this, data)
      } catch (e) { return logError(e) }
    }
    this.websocket.onerror = (err: Event): void => this.events.emit('error', err)
  }
}