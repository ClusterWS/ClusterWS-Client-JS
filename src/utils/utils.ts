export type TListener = (...args: any[]) => void
export type TSocketMessage = any

export interface IObject {
    [propName: string]: any
}

export interface IUserOptions {
    url: string
    autoReconnect?: boolean
    reconnectionIntervalMin?: number
    reconnectionIntervalMax?: number
    reconnectionAttempts?: number
}

export interface IOptions {
    url: string
    autoReconnect: boolean
    reconnectionIntervalMin: number
    reconnectionIntervalMax: number
    reconnectionAttempts: number
}

export function logError<T>(data: T): any {
    return console.log(data)
}