import {DAO} from "../lib/dao";
import {Station} from "./Station";
import {Table} from "../lib/query";
export interface StationInfoEntity {
    id:number;
    station:Station;
    text:string;
}


export class StationInfo extends DAO<StationInfoEntity> {
    static table = new Table('StationInfo');
    static id = StationInfo.field('id');

    static text = StationInfo.field('text');
    static stationId = StationInfo.field('stationId');

    static get rel() {
        return {
            station: StationInfo.belongsTo(Station, StationInfo.stationId, 'station')
        }
    }
}
