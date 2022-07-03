
import axios from 'axios';
import { registerWebHook } from './scheduler.js';

export function register(url: string) {
    let count_id1 = 0;
    registerWebHook('ID1', 'PT1M', async (): Promise<void> => {
        const response = await axios({
            method: 'post',
            url: url,
            data: {
                id: 'ID1',
                hello: 'World',
                count: count_id1++
            }
        });
        console.log(`WebHook status ${response.status} count=${count_id1}`);
    });
}
