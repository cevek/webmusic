import {Station} from "./Station";
import {DAO, field, foreignKey, belongsTo, Relation} from "../lib/tsorm/src/dao";
import {Field} from "../lib/tsorm/src/sql/DataSource";
export interface StationInfoEntity {
    id:number;
    station:Station;
    text:string;
}


export class StationInfo extends DAO<StationInfoEntity> {
    @field text: Field;

    @foreignKey(()=>Station)
    stationId: Field;

    @belongsTo(()=>Station)
    station: Relation;
}
