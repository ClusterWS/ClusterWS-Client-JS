export interface IOptions {
    url: string
    port: number
    autoReconnect: boolean
    reconnectionIntervalMin: number
    reconnectionIntervalMax: number
    reconnectionAttempts: number
}

export interface IPassedOptions {
    url: string
    port: number
    autoReconnect?: boolean
    reconnectionIntervalMin?: number
    reconnectionIntervalMax?: number
    reconnectionAttempts?: number
}

export function logError(data: any): any {
    return console.log(data)
}