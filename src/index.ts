import { Socket } from './lib/socket'
import { Options } from './lib/options'

/* 
    Main file which load provided configurations 
    and pass it to the socket object
*/
export class ClusterWS extends Socket {
    constructor(configurations: any) {
        super(new Options(configurations || {}))
    }
}