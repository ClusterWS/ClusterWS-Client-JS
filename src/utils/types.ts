export type Message = any
export type Listener = (...args: any[]) => void

export type CustomObject = {
  [propName: string]: any
}

export type Options = {
  url: string
  autoConnect: boolean
  autoReconnect: boolean
  autoReconnectOptions: {
    attempts: number
    minInterval: number
    maxInterval: number
  }
  autoResubscribe: boolean;
  encodeDecodeEngine: EncodeDecodeEngine | false
}

export type Configurations = {
  url: string
  autoConnect?: boolean;
  autoReconnect?: boolean
  autoReconnectOptions?: {
    attempts?: number
    minInterval?: number
    maxInterval?: number
  }
  autoResubscribe?: boolean;
  encodeDecodeEngine?: EncodeDecodeEngine
}

export type EncodeDecodeEngine = {
  encode: (message: Message) => Message,
  decode: (message: Message) => Message
}