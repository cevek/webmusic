import {DAO, Relation, belongsTo, foreignKey} from "../lib/dao";
import {Station} from "./Station";
import {Field} from "../lib/sql/DataSource";
export interface StationSimilarEntity {
    id:number;
    stationId1:number;
    stationId2:number;
}

export class StationSimilar extends DAO<StationSimilarEntity> {

    @foreignKey(()=>Station)
    stationId1: Field;

    @foreignKey(()=>Station)
    stationId2: Field;

    @belongsTo(()=>Station)
    station1: Relation;

    //todo:
    @belongsTo(()=>Station)
    station2: Relation;
}