import {DAO, belongsTo, field, Relation} from "../lib/dao";
import {Station} from "./Station";
import {inject} from "../lib/injector";
import {Field} from "../lib/sql/DataSource";
export interface StationInfoEntity {
    id:number;
    station:Station;
    text:string;
}


export class StationInfo extends DAO<StationInfoEntity> {
    @field text: Field;
    @field stationId: Field;

    @belongsTo(()=>inject(Station).id, ()=>inject(StationInfo).stationId)
    station: Relation;
}
