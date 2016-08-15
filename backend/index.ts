import {StationInfo} from "./models/StationInfo";
import {Recorder} from "./services/Recorder";
import {Station} from "./models/Station";
import {DBConfig} from "./lib/DBConfig";
import {bindInjection, inject} from "./lib/injector";
import {config} from "./config";
import {Track} from "./models/Track";
import {Fun} from "./lib/query";
import {Logger} from "./lib/Logger";
require('source-map-support').install();
Error.stackTraceLimit = 30;

bindInjection(DBConfig, config.db);

let runnedTasks = 0;
const limitTask = 50;
const duration = 60 * 60;
const logger = inject(Logger);
async function runTasks() {
    if (runnedTasks >= limitTask) {
        return;
    }
    const station = inject(Station);
    const count = limitTask - runnedTasks;
    const results = await station.findAll({
        attributes: Station.table.allFields(),
        join: Track.table.leftJoinOn(Station.id.equal(Track.stationId)),
        group: Station.id.asc(),
        order: new Fun('max', [Track.createdAt]).asc(),
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
    await runTasks()
}
xtime().catch(err => console.error(err instanceof Error ? err.stack : err));