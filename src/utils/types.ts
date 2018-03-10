export type Message = any
export type Listener = (...args: any[]) => void

export type CustomObject = {
  [propName: string]: any
}

export type Options = {
  url: string
  autoReconnect: boolean
  autoReconnectOptions: {
    attempts: number
    minInterval: number
    maxInterval: number
  }
}

export type Configurations = {
  url: string
  autoReconnect?: boolean
  autoReconnectOptions?: {
    attempts?: number
    minInterval?: number
    maxInterval?: number
  }
}