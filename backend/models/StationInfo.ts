import {DAO} from "../lib/dao";
import {Station} from "./Station";
export class StationInfo {
    id:number;

    station:Station[];

    text:string;
}

export class StationInfoDAO extends DAO<StationInfo> {
    table = this.setTable('stationInfo');
    text = this.addField('text');
    //station = this.addBelongsToRelation('station',)
}
