
import axios from 'axios';
import * as express from 'express';
import { ToadScheduler, AsyncTask, SimpleIntervalJob  } from "toad-scheduler";
import { default as Duration } from "iso8601-duration";

export const HookRouter = express.Router();

HookRouter.post('/webhook', (req, res) => {
    console.log(`WebHook `, req.body);
    res.sendStatus(200);
});


HookRouter.post('/resthook', async (req, res) => {
    console.log(`RESTHook `, req.body);
    res.sendStatus(200);
});

HookRouter.post('/resthook-other', async (req, res) => {
    console.log(`RESTHook OTHER `, req.body);
    if (req.body.event === 'PEEK') {
        await unsubscribeRESTHook(req.body.id);
    }
    res.sendStatus(200);
});

const SVCURL = process.env['SVCHOSTURL'];
const CLIENTURL = process.env['CLIENTURL'];

export async function register() {
    await subscribeRESTHook('OPEN');
    await subscribeRESTHook('CLOSE');
}

async function subscribeRESTHook(evname: string) {
    const uClientHook = new URL(CLIENTURL);
    uClientHook.pathname = '/hooks/resthook';

    return await invokeRESTCall('post',
                `/hooks/subscribe`, {
                    name: evname,
                    hookurl: uClientHook.toString()
                });
}

async function unsubscribeRESTHook(id: string) {
    return await invokeRESTCall('delete',
                `/hooks/subscribe/${id}`, undefined);
}

async function changeRESTSubscription(id: string, url: string) {
    const uClientHook = new URL(CLIENTURL);
    uClientHook.pathname = url;

    return await invokeRESTCall('put', `/hooks/subscribe/${id}`, {
        hookurl: uClientHook.toString()
    });
}

async function checkSubscription() {
    return await invokeRESTCall('get', `/hooks/subscribe`, undefined);
}

async function checkSubscriptionDescription(id: string) {
    return await invokeRESTCall('get',
            `/hooks/subscribe/${id}`, undefined);
}

const scheduler = new ToadScheduler();

export async function initscheduler() {

    const reqSubsTask = new AsyncTask(`Request subscriptions`, async () => {
        const subscriptions = await checkSubscription();
        for (let sub of subscriptions.subscribable) {
            if (sub.subscribed) {
                const subDesc = await checkSubscriptionDescription(sub.id);
                console.log(subDesc);

                if (sub.event === 'PEEK'
                 && sub.hookurl === '/hooks/resthook') {
                    await changeRESTSubscription(
                                sub.id, '/hooks/resthook-other');
                }
            } else if (sub.event === 'PEEK') {
                await subscribeRESTHook('PEEK');
            }
        }
    });
    
    const reqSubsJob = new SimpleIntervalJob(
                Duration.parse('PT1M'),
                reqSubsTask,
                'req_subs');
    
    scheduler.addSimpleIntervalJob(reqSubsJob);
}

async function invokeRESTCall(method: string, url: string, data) {

    console.log(SVCURL);
    const uRequest = new URL(SVCURL);
    uRequest.pathname = url;
    console.log(uRequest.toString());
    const subresp = await axios({
        method: method,
        url: uRequest.toString(),
        headers: {
            authcode: '8c4fb1ea-f594-11ec-8678-3bde07b709e0'
        },
        data: data
    });

    console.log(`${method} ${url} result: `, subresp.data);
    return subresp.data;
}