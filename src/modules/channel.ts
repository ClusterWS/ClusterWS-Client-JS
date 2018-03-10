import ClusterWS from '../index'
import { Listener } from '../utils/types'
import { logError } from '../utils/functions'

export class Channel {
  public name: string
  private socket: ClusterWS
  private listener: Listener

  constructor(socket: ClusterWS, name: string) {
    this.name = name
    this.socket = socket
    this.subscribe()
  }

  public watch(listener: Listener): Channel {
    if ({}.toString.call(listener) !== '[object Function]')
      return logError('Listener must be a function')
    this.listener = listener
    return this
  }

  public publish(data: any): Channel {
    this.socket.send(this.name, data, 'publish')
    return this
  }

  public unsubscribe(): void {
    this.socket.send('unsubscribe', this.name, 'system')
    this.socket.channels[this.name] = null
  }

  public onMessage(data: any): void {
    this.listener && this.listener.call(null, data)
  }

  public subscribe(): void {
    this.socket.send('subscribe', this.name, 'system')
  }
}