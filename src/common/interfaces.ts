export interface Options {
    url: string
    port: number
    autoReconnect: boolean
    reconnectionInterval: number
    reconnectionAttempts: number
}

export interface UserOptions {
    url: string
    port: number
    autoReconnect?: boolean
    reconnectionInterval?: number
    reconnectionAttempts?: number
}