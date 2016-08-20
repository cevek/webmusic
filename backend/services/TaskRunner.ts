import {Logger} from "../lib/Logger";
import {inject} from "../lib/injector";
import {Config} from "../config";
import {DB} from "../lib/db";
import {Station, StationEntity} from "../models/Station";
import {Attribute} from "../lib/query";
import {Track} from "../models/Track";
import {SQLFunctions} from "../lib/SQLFunctions";
import {Recorder} from "./Recorder";
export class TaskRunner {
    runnedTasks = 0;
    config = inject(Config);
    logger = inject(Logger);
    minDiffSeconds = 1 * 3600;
    db = inject(DB);
    station = inject(Station);
    recordingStations = new Set<number>();

    async run() {
        try {
            this.logger.log(`Run tasks, current RunnedTasks: ${this.runnedTasks}, limit: ${this.config.limitConcurentProcess}`);
            if (this.runnedTasks >= this.config.limitConcurentProcess) {
                return;
            }
            const limit = this.config.limitConcurentProcess - this.runnedTasks;

            const lastTrackDate = new Attribute(null, 'lastTrackDate');

            const results = await this.station.findAll({
                attributes: [Station.table.allFields(), SQLFunctions.MAX(Track.createdAt).as(lastTrackDate)],
                table: Station.table.leftJoin(Track.table, Station.id.equal(Track.stationId)),
                group: Station.id,
                order: lastTrackDate
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