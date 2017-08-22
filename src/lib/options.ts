import { logError } from './utils/common'

export class Options {
    url: string
    port: number
    autoReconnect: boolean
    reconnectionInterval: number
    reconnectionAttempts: number

    constructor(configurations: any) {

        if (!configurations.url) throw logError('Url must be provided')
        if (!configurations.port) throw logError('Port must be provided')

        this.url = configurations.url
        this.port = configurations.port
        this.autoReconnect = configurations.autoReconnect || false
        this.reconnectionInterval = configurations.reconnectionInterval || 1000
        this.reconnectionAttempts = configurations.reconnectionAttempts || 0
    }
}
