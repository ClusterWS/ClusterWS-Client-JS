export interface Configurations {
    url: string,
    port: number,
    autoReconnect?: boolean,
    reconnectInterval?: number;
    reconnectAttempts?: number;
}

export class Options {
    url: string;
    port: number;
    autoReconnect: boolean;
    reconnectInterval: number;
    reconnectAttempts: number;

    constructor(configuration: Configurations) {

        if (!configuration.url) throw new Error('Url must be provided');
        if (!configuration.port) throw new Error('Port must be provided');

        this.url = configuration.url;
        this.port = configuration.port;
        this.autoReconnect = configuration.autoReconnect || false;
        this.reconnectInterval = configuration.reconnectInterval || 10000;
        this.reconnectAttempts = configuration.reconnectAttempts|| 0;
    }
}
