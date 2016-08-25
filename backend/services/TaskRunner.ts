import {Logger} from "../lib/Logger";
import {Config} from "../config";
import {Station, StationEntity} from "../models/Station";
import {Recorder} from "./Recorder";
import {Track} from "../models/Track";
import {inject} from "../lib/dits/index";
import {DB} from "../lib/tsorm/src/db";
import {SQL} from "../lib/tsorm/src/sql/index";
export class TaskRunner {
    runnedTasks = 0;
    config = inject(Config);
    logger = inject(Logger);
    minDiffSeconds = 1 * 3600;
    db = inject(DB);
    station = inject(Station);
    track = inject(Track);
    recordingStations = new Set<number>();

    async run() {
        const Station = this.station;
        const Track = this.track;
        try {
            this.logger.log(`Run tasks, current RunnedTasks: ${this.runnedTasks}, limit: ${this.config.limitConcurentProcess}`);
            if (this.runnedTasks >= this.config.limitConcurentProcess) {
                return;
            }
            const limit = this.config.limitConcurentProcess - this.runnedTasks;

            const lastTrackDate = SQL.identifier('lastTrackDate');

            const results = await Station.findAll({
                attrs: [Station.table.all(), SQL.fun.MAX(Track.createdAt).as(lastTrackDate)],
                from: Station.table.leftJoin(Track.table).on(Station.id.equal(Track.stationId)),
                groupBy: Station.id,
                orderBy: lastTrackDate
            }) as (StationEntity & {lastTrackDate: Date})[];

            // this.logger.log('Run stations', results.map(st => st.slug));

            for (let i = 0; i < results.length; i++) {
                const station = results[i];
                if (this.recordingStations.has(station.id)) {
                    continue;
                }
                if (station.lastTrackDate.getTime() < this.minDiffSeconds * 1000) {
                    continue;
                }
                const recorder = new Recorder(station);

                if (this.runnedTasks >= this.config.limitConcurentProcess) {
                    break;
                }
                this.runnedTasks++;
                this.recordingStations.add(station.id);
                recorder.start().then(() => {
                    this.runnedTasks--;
                    this.recordingStations.delete(station.id);
                    this.run()
                })
            }
        }
        catch (e) {
            this.logger.error(e);
        }
    }
}