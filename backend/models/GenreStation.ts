import {Genre} from "./Genre";
import {Station, StationEntity} from "./Station";
import {DAO, foreignKey, belongsTo, Relation} from "../lib/tsorm/src/dao";
import {Field} from "../lib/tsorm/src/sql/DataSource";
export class GenreStationEntity {
    id:number;
    genre:Genre;
    station:StationEntity[];
}

export class GenreStation extends DAO<GenreStationEntity> {
    @foreignKey(()=>Genre)
    genreId: Field;

    @foreignKey(()=>Station)
    stationId: Field;

    @belongsTo(()=>Station)
    station: Relation;

    @belongsTo(()=>Genre)
    genre: Relation;
}
