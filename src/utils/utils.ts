export type TListener = (...args: any[]) => void
export type TSocketMessage = any

export interface IObject {
    [propName: string]: any
}

export interface IUserOptions {
    url: string
    port: number
    autoReconnect?: boolean
    reconnectionIntervalMin?: number
    reconnectionIntervalMax?: number
    reconnectionAttempts?: number
    secure?: boolean
}

export interface IOptions {
    url: string
    port: number
    autoReconnect: boolean
    reconnectionIntervalMin: number
    reconnectionIntervalMax: number
    reconnectionAttempts: number
    secure: boolean
}

export function logError<T>(data: T): any {
    return console.log(data)
}