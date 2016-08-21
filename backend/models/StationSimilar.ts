import {DAO} from "../lib/dao";
import {Station} from "./Station";
import {SQL} from "../lib/sql/index";
export interface StationSimilarEntity {
    id:number;
    stationId1:number;
    stationId2:number;
}

export class StationSimilar extends DAO<StationSimilarEntity> {
    static table = SQL.table('StationSimilar');
    static id = StationSimilar.field('id');

    static stationId1 = StationSimilar.field('stationId1');
    static stationId2 = StationSimilar.field('stationId2');

    static get rel() {
        return {
            station1: StationSimilar.belongsTo(Station, StationSimilar.stationId1, 'station1'),
            station2: StationSimilar.belongsTo(Station, StationSimilar.stationId2, 'station2'),
        }
    }
}