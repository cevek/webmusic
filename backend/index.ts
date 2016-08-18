import * as bluebird from 'bluebird';
declare var Promise:typeof bluebird;
global.Promise = bluebird;

import {Recorder} from "./services/Recorder";
import {Station, StationEntity} from "./models/Station";
import {DBConfig} from "./lib/DBConfig";
import {bindInjection, inject} from "./lib/injector";

import {Track} from "./models/Track";
import {Logger} from "./lib/Logger";
import {FileSync} from "./services/FileSync";
import {sleep} from "./lib/Utils";
import {SQLFunctions} from "./lib/SQLFunctions";
import {Config} from "./config";
import {DB} from "./lib/db";
import {QueryBuilder} from "./lib/query";

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
    const logger = inject(Logger);
    const minDiffDays = 1;
    const db = inject(DB);

    async function runTasks() {
        logger.log(`Run tasks, current RunnedTasks: ${runnedTasks}, limit: ${config.limitConcurentProcess}`);
        if (runnedTasks >= config.limitConcurentProcess) {
            return;
        }
        const station = inject(Station);
        const count = config.limitConcurentProcess - runnedTasks;

        const results = await db.transaction(async (trx) => {

            let query = new QueryBuilder().select(null).from(
                new QueryBuilder()
                    .select([Station.table.allFields(), SQLFunctions.MAX(Track.createdAt).as(Track.createdAt.onlyName()), Track.error])
                    .from(Station.table.leftJoin(Track.table,
                        Station.id.equal(Track.stationId)))
                    .groupBy(Station.id)
                    .brackets()
                    .as(Station.table)
            )
                .where(
                    SQLFunctions.DATEDIFF(new Date(), Track.createdAt.onlyName()).greatThan(minDiffDays)
                        .or(Track.createdAt.onlyName().isNull())
                )
                .orderBy(Track.createdAt.onlyName().asc());

            const result = await station.query(query, null, trx) as (StationEntity & {createdAt: Date, error: boolean})[];

            await station.updateCustom({
                set: Station.recording.assign(true),
                where: Station.id.in(result.map(st => st.id)),
            }, trx)
            return result;
        })

        logger.log('Run stations', results.map(st => st.slug));

        for (let i = 0; i < results.length; i++) {
            const station = results[i];
            const recorder = new Recorder(station);

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
    await fileSync.resetRecordingStations();
    await fileSync.setErrorToAllNonStoppedTracks();
    await fileSync.removeOldTracks();
    await taskRunner();

    while (true) {
        await sleep(60 * 60 * 1000);
        await fileSync.removeOldTracks();
    }
}

xtime().catch(err => console.error(err instanceof Error ? err.stack : err));