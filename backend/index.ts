import * as bluebird from 'bluebird';
declare var Promise: typeof bluebird;
global.Promise = bluebird;

import {Recorder} from "./services/Recorder";
import {Station} from "./models/Station";
import {DBConfig} from "./lib/DBConfig";
import {bindInjection, inject} from "./lib/injector";
import {config} from "./config";
import {Track} from "./models/Track";
import {Logger} from "./lib/Logger";
import {FileSync} from "./services/FileSync";
import {sleep} from "./lib/Utils";
import {SQLFunctions} from "./lib/SQLFunctions";

require('source-map-support').install();
Error.stackTraceLimit = 30;
bluebird.longStackTraces();


bindInjection(DBConfig, config.db);

let runnedTasks = 0;
const limitTask = 50;
const duration = 30 * 60;
const logger = inject(Logger);
const minDiffDays = 3;
async function runTasks() {
    if (runnedTasks >= limitTask) {
        return;
    }
    const station = inject(Station);
    const count = limitTask - runnedTasks;
    const results = await station.findAll({
        attributes: Station.table.allFields(),
        table: Station.table.leftJoin(Track.table, Station.id.equal(Track.stationId)),
        group: Station.id.asc(),
        where: SQLFunctions.DATEDIFF(Track.createdAt, new Date()).greatOrEqualThan(minDiffDays),
        order: SQLFunctions.MAX(Track.createdAt).asc(),
        limit: count
    });
    logger.log('Run tasks', results.length);

    for (let i = 0; i < results.length; i++) {
        const station = results[i];
        const recorder = new Recorder(station, duration);

        runnedTasks++;
        recorder.start().then(() => {
            runnedTasks--;
            runTasks();
        })
    }
    return;
}

async function xtime() {
    const fileSync = inject(FileSync);
    await fileSync.setErrorToAllNonStoppedTracks();
    await fileSync.removeOldTracks();
    await runTasks();

    while (true) {
        await sleep(60 * 60 * 1000);
        await fileSync.removeOldTracks();
    }
}

xtime().catch(err => console.error(err instanceof Error ? err.stack : err));