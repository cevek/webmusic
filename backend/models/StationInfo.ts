import {DAO, belongsTo, field, Relation, foreignKey} from "../lib/dao";
import {Station} from "./Station";
import {Field} from "../lib/sql/DataSource";
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
