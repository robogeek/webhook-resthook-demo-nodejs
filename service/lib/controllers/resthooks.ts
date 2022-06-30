
import * as express from 'express';
import { reqFromClient, clientForReq, client } from '../clients';
import { v4 as uuidv4} from 'uuid';
import axios from 'axios';

export const HookRouter = express.Router();


// List the things which can be subscribed
HookRouter.get('/subscribe', reqFromClient, (req, res) => {
    const client = clientForReq(req);
    const ret = {
        subscribable: []
    };
    for (const evnm of eventNames) {
        const subscription = clientSubscription(client, evnm);
        ret.subscribable.push({
            name: evnm,
            subscribed: typeof subscription !== 'undefined',
            id: subscription ? subscription.id : undefined
        });
    }
    res.status(200).json(ret);
});

// Subscribe to an event
//
// {
//    name: 'EVENT-NAME', hookurl: 'http://host/path/to/endpoint'
// }
HookRouter.post('/subscribe', reqFromClient, (req, res) => {
    const client = clientForReq(req);
    const subscription = clientSubscription(client, req.body.name);
    if (subscription) {
        res.status(404).json({
            message: `Event ${req.body.name} already subscribed by ${client.clientID}`
        });
    } else {
        const subID = uuidv4();
        console.log(`Subscribing ${client.clientID} to event ${req.body.name} with ${subID}`);
        subscriptions.push(<subscription>{
            id: subID,
            clientID: client.clientID,
            event: req.body.name,
            hookurl: req.body.hookurl
        });
        res.status(200).json({
            message: 'OK'
        });
    }
});

// Get data on a specific subscription
HookRouter.get('/subscribe/:id', reqFromClient, (req, res) => {
    const client = clientForReq(req);
    const subscription = clientSubscriptionByID(client, req.params.id);
    res.status(202).json(subscription);
});

// Modify a subscription
HookRouter.put('/subscribe/:id', reqFromClient, (req, res) => {
    const client = clientForReq(req);
    const subscription = clientSubscriptionByID(client, req.params.id);
    if (req.body.hookurl) subscription.hookurl = req.body.hookurl;
    // if (req.body.newname) subscription.event = req.body.newname;
    res.status(202).json({
        message: 'OK'
    });
});

// Delete a subscription
HookRouter.delete('/subscribe/:id', reqFromClient, (req, res) => {
    const client = clientForReq(req);
    deleteClientSubscription(client, req.params.id);
    res.status(202).json({
        message: 'OK'
    });
});

export type subscription = {
    id: string,
    clientID: string;
    event: string;
    hookurl: string;
}

export let subscriptions: Array<subscription> = [];

export const eventNames = [ 'OPEN', 'CLOSE', 'PEEK' ];

function deleteClientSubscription(client: client, id: string): void {
    console.log(`Deleting client subscription `)
    subscriptions = subscriptions.filter(sub => {
        return sub.id !== id;
    });
}

function clientSubscription(client: client, nm: string): subscription {
    for (const sub of subscriptions) {
        if (sub.clientID === client.clientID) {
            if (sub.event === nm) {
                return sub;
            }
        }
    }
    return undefined;
}

function clientSubscriptionByID(client: client, id: string): subscription {
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

let count = 0;

export async function sendRESTHookNotifications(eventName: string): Promise<void> {

    const subs = eventSubscriptions(eventName);
    for (const sub of subs) {
        const response = await axios({
            method: 'post',
            url: sub.hookurl,
            data: {
                id: sub.id,
                event: sub.event,
                count: count++
            }
        });
        console.log(`RESTHook ${eventName} status ${response.status} client ${sub.clientID} count=${count}`);
    }
    // await this.poll();
}

