import * as bluebird from "bluebird";
import {DBConfig} from "./lib/DBConfig";
import {bindInjection, inject} from "./lib/injector";
import {FileSync} from "./services/FileSync";
import {sleep} from "./lib/Utils";
import {Config} from "./config";
import {TaskRunner} from "./services/TaskRunner";
import {Logger} from "./lib/Logger";
declare var Promise:typeof bluebird;
global.Promise = bluebird;

const ENV = process.env['NODE_ENV'] || 'development';

require('source-map-support').install();
Error.stackTraceLimit = 30;
bluebird.longStackTraces();

const {config} = require('./config.' + ENV + '.js');
bindInjection(Config, config);
bindInjection(DBConfig, config.db);

async function start() {
    const logger = inject(Logger)
    try {
        const fileSync = inject(FileSync);
        await fileSync.removeNonStoppedTracks();
        await fileSync.removeOldTracks();

        const taskRunner = inject(TaskRunner);
        taskRunner.run();

        while (true) {
            await sleep(5 * 60 * 1000);
            await fileSync.removeOldTracks();
            taskRunner.run();
        }
    } catch (e) {
        logger.error(e);
    }
}
start();