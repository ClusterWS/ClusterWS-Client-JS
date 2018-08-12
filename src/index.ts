import { Channel } from './modules/channel'
import { EventEmitter } from './modules/emitter'
import { encode, decode } from './modules/parser'
import { logError, uint8ArrayToString, stringToArrayBuffer } from './utils/functions'
import { Options, Configurations, Listener, CustomObject, Message } from './utils/types'

declare const window: any
const Socket: any = window.MozWebSocket || window.WebSocket

export default class ClusterWS {
  public events: EventEmitter = new EventEmitter()
  public options: Options
  public channels: CustomObject = {}
  public useBinary: boolean

  private pong: ByteString = stringToArrayBuffer('A')
  private websocket: WebSocket
  private pingTimeout: any
  private pingInterval: number
  private reconnectionAttempted: number = 0

  constructor(configurations: Configurations) {
    this.options = {
      url: configurations.url,
      autoReconnect: configurations.autoReconnect || false,
      autoReconnectOptions: configurations.autoReconnectOptions ? {
        attempts: configurations.autoReconnectOptions.attempts || 0,
        minInterval: configurations.autoReconnectOptions.minInterval || 1000,
        maxInterval: configurations.autoReconnectOptions.maxInterval || 5000
      } : { attempts: 0, minInterval: 1000, maxInterval: 5000 },
      encodeDecodeEngine: configurations.encodeDecodeEngine || false
    }

    if (!this.options.url)
      return logError('Url must be provided and it must be a string')

    if (this.options.autoReconnectOptions.minInterval > this.options.autoReconnectOptions.maxInterval)
      return logError('minInterval option can not be more than maxInterval option')

    this.create()
  }

  public on(event: 'error', listener: (err: ErrorEvent) => void): void
  public on(event: 'connect', listener: () => void): void
  public on(event: 'disconnect', listener: (code?: number, reason?: string) => void): void
  public on(event: string, listener: Listener): void
  public on(event: string, listener: Listener): void {
    this.events.on(event, listener)
  }

  public getState(): number {
    return this.websocket ? this.websocket.readyState : 0
  }

  public resetPing(interval?: number): void {
    if (interval)
      this.pingInterval = interval
    clearTimeout(this.pingTimeout)
    this.pingTimeout = setTimeout(() => this.disconnect(4001, 'Did not get pings'), this.pingInterval * 2 + 100)
  }

  public disconnect(code?: number, reason?: string): void {
    this.websocket.close(code || 1000, reason)
  }

  public send(event: string, message: Message, eventType: string = 'emit'): void {
    message = this.options.encodeDecodeEngine ?
      this.options.encodeDecodeEngine.encode(message) : message

    this.websocket.send(this.useBinary ?
      stringToArrayBuffer(encode(event, message, eventType)) :
      encode(event, message, eventType))
  }

  public subscribe(channelName: string): Channel {
    return this.channels[channelName] ? this.channels[channelName] :
      this.channels[channelName] = new Channel(this, channelName)
  }

  public getChannelByName(channelName: string): Channel {
    return this.channels[channelName]
  }

  private create(): void {
    this.websocket = new Socket(this.options.url)
    this.websocket.binaryType = 'arraybuffer'

    this.websocket.onopen = (): void => {
      this.reconnectionAttempted = 0
      for (let i: number = 0, keys: string[] = Object.keys(this.channels), keysLength: number = keys.length; i < keysLength; i++)
        this.channels.hasOwnProperty(keys[i]) && this.channels[keys[i]].subscribe()
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
        } else console.log('Some thing went wrong with close event please contact developer')
      } else {
        this.events.removeAllEvents()
        for (let i: number = 0, keys: string[] = Object.keys(this), keysLength: number = keys.length; i < keysLength; i++)
          this[keys[i]] = null
      }
    }

    this.websocket.onmessage = (data: Message): void => {
      const message: Message = typeof data.data !== 'string' ? new Uint8Array(data.data) : data.data

      if (message[0] === 57) {
        this.websocket.send(this.pong)
        return this.resetPing()
      }

      try {
        decode(this, JSON.parse(typeof message === 'string' ? message : uint8ArrayToString(message)))
      } catch (e) { return logError(e) }
    }
    this.websocket.onerror = (err: ErrorEvent): void => this.events.emit('error', err)
  }
}