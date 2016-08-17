import * as bluebird from 'bluebird';
declare var Promise:typeof bluebird;
global.Promise = bluebird;

import {Recorder} from "./services/Recorder";
import {Station} from "./models/Station";
import {DBConfig} from "./lib/DBConfig";
import {bindInjection, inject} from "./lib/injector";

import {Track} from "./models/Track";
import {Logger} from "./lib/Logger";
import {FileSync} from "./services/FileSync";
import {sleep} from "./lib/Utils";
import {SQLFunctions} from "./lib/SQLFunctions";
import {Config} from "./config";

const ENV = process.env['NODE_ENV'] || 'development';

require('source-map-support').install();
Error.stackTraceLimit = 30;
bluebird.longStackTraces();

{
    const {config} = require('./config.' + ENV + '.js');
    bindInjection(Config, config);
    bindInjection(DBConfig, config.db);
}

async function taskRunner() {
    let runnedTasks = 0;
    const config = inject(Config);
    const duration = 30 * 60;
    const logger = inject(Logger);
    const minDiffDays = 1;

    async function runTasks() {
        if (runnedTasks >= config.limitConcurentProcess) {
            return;
        }
        const station = inject(Station);
        const count = config.limitConcurentProcess - runnedTasks;
        const results = await station.findAll({
            attributes: [Station.table.allFields()],
            table: Station.table.leftJoin(Track.table, Station.id.equal(Track.stationId)),
            group: Station.id.asc(),
            where: SQLFunctions.DATEDIFF(new Date(), Track.createdAt).greatOrEqualThan(minDiffDays).and(Track.createdAt.isNotNull()),
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
    await runTasks();
}

async function xtime() {
    const fileSync = inject(FileSync);
    await fileSync.setErrorToAllNonStoppedTracks();
    await fileSync.removeOldTracks();
    await taskRunner();

    while (true) {
        await sleep(60 * 60 * 1000);
        await fileSync.removeOldTracks();
    }
}

xtime().catch(err => console.error(err instanceof Error ? err.stack : err));