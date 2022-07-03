
import { client } from './clients.js';

export type subscription = {

    /**
     * Identifier for this event subscription.
     */
    id: string,

    /**
     * The identifier of the client service that made
     * the subcription
     */
    clientID: string;

    /**
     * The event the client subscribed to
     */
    event: string;

    /**
     * The URL the client requested that event notifications be sent
     */
    hookurl: string;
}

export let subscriptions: Array<subscription> = [];

export function allSubscriptions(): Array<subscription> {
    return subscriptions;
}

export function addSubscription(sub: subscription): void {
    subscriptions.push(sub);
}

export function deleteClientSubscription(client: client, id: string): void {
    console.log(`Deleting client subscription `)
    subscriptions = subscriptions.filter(sub => {
        return sub.id !== id;
    });
}

export function clientSubscription(client: client, nm: string): subscription {
    for (const sub of subscriptions) {
        if (sub.clientID === client.clientID) {
            if (sub.event === nm) {
                return sub;
            }
        }
    }
    return undefined;
}

export function clientSubscriptionByID(client: client, id: string): subscription {
    for (const sub of subscriptions) {
        if (sub.clientID === client.clientID) {
            if (sub.id === id) {
                return sub;
            }
        }
    }
    return undefined;
}

export function eventSubscriptions(nm: string): Array<subscription> {
    const ret: Array<subscription> = [];
    for (const sub of subscriptions) {
        if (sub.event === nm) ret.push(sub);
    }
    return ret;
}
