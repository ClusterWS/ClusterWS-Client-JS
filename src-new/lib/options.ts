export class Options {
    url: string
    port: number
    autoReconnect: boolean
    reconnectionInterval: number
    reconnectionAttempts: number

    constructor(configurations: any) {

        if (!configurations.url) throw new Error('Url must be provided')
        if (!configurations.port) throw new Error('Port must be provided')

        this.url = configurations.url
        this.port = configurations.port
        this.autoReconnect = configurations.autoReconnect || false
        this.reconnectionInterval = configurations.reconnectInterval || 10000
        this.reconnectionAttempts = configurations.reconnectAttempts || 0
    }
}
