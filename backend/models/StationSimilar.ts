import {Station} from "./Station";
import {DAO, foreignKey, belongsTo, Relation} from "../lib/tsorm/src/dao";
import {Field} from "../lib/tsorm/src/sql/DataSource";
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