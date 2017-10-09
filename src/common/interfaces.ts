export interface Options {
    url: string
    port: number
    autoReconnect: boolean
    reconnectionIntervalMin: number
    reconnectionIntervalMax: number
    reconnectionAttempts: number
}

export interface UserOptions {
    url: string
    port: number
    autoReconnect?: boolean
    reconnectionIntervalMin?: number
    reconnectionIntervalMax?: number
    reconnectionAttempts?: number
}