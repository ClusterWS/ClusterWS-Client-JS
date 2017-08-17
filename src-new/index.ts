import { Socket } from './lib/socket'
import { Options } from './lib/options'

export class ClusterWS extends Socket {
    constructor(configurations: any) {
        super(new Options(configurations || {}))
    }
}