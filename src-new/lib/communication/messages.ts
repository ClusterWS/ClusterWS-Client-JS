import { _ } from '../utils/fp'

export function socketMessages(event: string, data: any, type: string) {
    return _.switchcase({
        'publish': JSON.stringify({ 'm': ['p', event, data] }),
        'system': JSON.stringify({ 'm': ['s', event, data] }),
        'emit': JSON.stringify({ 'm': ['e', event, data] }),
        'ping': event
    })(type)
}