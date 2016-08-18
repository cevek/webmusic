import {Logger} from "../lib/Logger";
import {inject} from "../lib/injector";
import {Config} from "../config";
import {DB} from "../lib/db";
import {Station, StationEntity} from "../models/Station";
import {QueryBuilder} from "../lib/query";
import {Track} from "../models/Track";
import {SQLFunctions} from "../lib/SQLFunctions";
import {Recorder} from "./Recorder";
export class TaskRunner {
    runnedTasks = 0;
    config = inject(Config);
    logger = inject(Logger);
    minDiffDays = 1;
    db = inject(DB);
    station = inject(Station);

    async run() {
        try {
            this.logger.log(`Run tasks, current RunnedTasks: ${this.runnedTasks}, limit: ${this.config.limitConcurentProcess}`);
            if (this.runnedTasks >= this.config.limitConcurentProcess) {
                return;
            }
            const limit = this.config.limitConcurentProcess - this.runnedTasks;

            const results = await this.db.transaction(async(trx) => {
                let query = new QueryBuilder().select(null).from(
                    new QueryBuilder()
                        .select([Station.table.allFields(), Station.id.as('foo'), SQLFunctions.MAX(Track.createdAt).as(Track.createdAt.onlyName())])
                        .from(Station.table.leftJoin(Track.table,
                            Station.id.equal(Track.stationId)))
                        .groupBy(Station.id)
                        .brackets()
                        .as(Station.table))
                    .where(
                        SQLFunctions.DATEDIFF(new Date(), Track.createdAt.onlyName()).greatThan(this.minDiffDays)
                            .or(Track.createdAt.onlyName().isNull()))
                    .orderBy(Track.createdAt.onlyName().asc())
                    .limit(limit);

                const result = await this.station.query(query, null, trx) as (StationEntity)[];

                await this.station.updateCustom({
                    set: Station.recording.assign(true),
                    where: Station.id.in(result.map(st => st.id)),
                }, trx)
                return result;
            })

            this.logger.log('Run stations', results.map(st => st.slug));

            for (let i = 0; i < results.length; i++) {
                const station = results[i];
                const recorder = new Recorder(station);

                this.runnedTasks++;
                recorder.start().then(() => {
                    this.runnedTasks--;
                    this.run()
                })
            }
        }
        catch (e) {
            this.logger.error(e);
        }
    }
}