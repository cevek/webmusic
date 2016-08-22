import {DAO, field, Relation, belongsTo} from "../lib/dao";
import {Station} from "./Station";
import {Field} from "../lib/sql/DataSource";
import {inject} from "../lib/injector";
export interface StationSimilarEntity {
    id:number;
    stationId1:number;
    stationId2:number;
}

export class StationSimilar extends DAO<StationSimilarEntity> {
    @field stationId1: Field;
    @field stationId2: Field;

    @belongsTo(()=>inject(Station).id, ()=>inject(StationSimilar).stationId1)
    station1: Relation;

    @belongsTo(()=>inject(Station).id, ()=>inject(StationSimilar).stationId2)
    station2: Relation;
}