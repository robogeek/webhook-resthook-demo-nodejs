import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as logger from 'morgan';
import * as util from 'util';
import * as path from 'path';
import * as http from "http";

import {
    HookRouter, initscheduler, register as registerRESTHooks
} from './controllers/webhook.js';

/*
// import * as path from 'path';
import * as url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
*/

import { env } from 'process';

const app: express.Express = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser('keyboard mouse'));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/hooks', HookRouter);

let httpPort;
let httpServer;

export default app;

// Proceed with setting up the HTTP Server
httpPort = normalizePort(process.env.PORT || 8080);
app.set("port", httpPort);
httpServer = http.createServer(app);
installErrorHandler(httpServer);
httpServer.listen(httpPort, () => {
    console.log(`=================================`);
    console.log(`======= ENV: ${app.get('env')} =======`);
    console.log(`App CLIENT listening on the port ${app.get('port')}`);
    console.log(`=================================`);
});

(async () => {
    await registerRESTHooks();
    await initscheduler();
})()
.catch(err => {
    console.error(`Registration crashed because of ${err.message}`);
});

// Abstracted from https://nodejs.org/api/errors.html
interface SystemError {
    address: string; 
    code: string; 
    dest: string;
    errno: number | string;
    info: any;
    message: string;
    path: string;
    port: number;
    syscall: string;
}

function installErrorHandler(httpServer) {
    httpServer.on("error", function(error: SystemError) {
        if (error.syscall !== "listen") {
            throw error;
        }

        const bind = typeof httpPort === "string"
            ? "Pipe " + httpPort
            : "Port " + httpPort;

        switch (error.code) {
        case "EACCES":
            console.error(bind + " requires elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
        }
    });
}

process.on('uncaughtException', function(err) { 
    console.error("I've crashed - uncaughtException - "+ (err.stack || err)); 
});
process.on('unhandledRejection', (reason, p) => {
    console.error(`Unhandled Rejection at: ${util.inspect(p)} reason: ${reason}`);
});
  
function normalizePort(val): number {
    const port = parseInt(val, 10);
    if (isNaN(port)) { return val; }
    if (port >= 0) { return port; }
    throw new Error(`normalizePort given invalid port specifier ${val}`);
}
