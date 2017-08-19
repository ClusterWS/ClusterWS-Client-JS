import { _ } from '../utils/fp'

export function socketMessages(event: string, data: any, type: string) {
    return _.switchcase({
        'publish': JSON.stringify({ 'm': ['p', event, data] }),
        'emit': JSON.stringify({ 'm': ['e', event, data] }),
        'system': _.switchcase({
            'subsribe': JSON.stringify({ 'm': ['s', 's', data] }),
            'unsubscribe': JSON.stringify({ 'm': ['s', 'u', data] })
        })(event),
        'ping': event
    })(type)
}