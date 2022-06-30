import { ToadScheduler, AsyncTask, SimpleIntervalJob  } from "toad-scheduler";
import { default as Duration } from "iso8601-duration";
import { eventNames, sendRESTHookNotifications } from './controllers/resthooks.js';


const scheduler = new ToadScheduler();

export function registerWebHook(id: string, duration: string, cb) {

    const webhookTask = new AsyncTask(`Send ${id}`, cb);
    
    const webhookJob = new SimpleIntervalJob(
                Duration.parse(duration),
                webhookTask,
                id);
    
    scheduler.addSimpleIntervalJob(webhookJob);
    
}

for (const evnm of eventNames) {

    const restTask = new AsyncTask(`Send ${evnm} Hooks`, async (): Promise<void> => {
        await sendRESTHookNotifications(evnm);
    });
    
    const restJob = new SimpleIntervalJob(
                Duration.parse('PT1M'),
                restTask,
                `id_${evnm}_hooks`);
    
    scheduler.addSimpleIntervalJob(restJob);
    
}
