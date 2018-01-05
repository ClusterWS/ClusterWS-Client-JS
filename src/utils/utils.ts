export type Listener = (...args: any[]) => void

export interface CustomObject {
    [propName: string]: any
}

export interface Options {
    url: string
    autoReconnect: boolean
    reconnectionAttempts: number
    reconnectionIntervalMin: number
    reconnectionIntervalMax: number
}

export interface Configurations {
    url: string
    autoReconnect?: boolean
    reconnectionAttempts?: number
    reconnectionIntervalMin?: number
    reconnectionIntervalMax?: number
}

export function logError<T>(data: T): any {
    return console.log(data)
}