
export class Options {
    port: number;
    url: string;
    // Construct an option object
    constructor(url: string, port: number) {
        // Make sure that path and port are exist
        if(!url){
            throw new Error('Url must be provided');
        }
        if(!port){
            throw new Error('Port must be provided');
        }
        // Set default params in case of no params
        this.url = url;
        this.port = port;
    }
}
