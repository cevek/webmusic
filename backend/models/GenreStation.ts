import {DAO, field, Relation, belongsTo} from "../lib/dao";
import {Genre} from "./Genre";
import {Station, StationEntity} from "./Station";
import {Field} from "../lib/sql/DataSource";
import {inject} from "../lib/injector";
export class GenreStationEntity {
    id:number;
    genre:Genre;
    station:StationEntity[];
}

export class GenreStation extends DAO<GenreStationEntity> {
    @field genreId: Field;
    @field stationId: Field;

    @belongsTo(()=>inject(Station).id, ()=>inject(GenreStation).stationId)
    station: Relation;

    @belongsTo(()=>inject(Genre).id, ()=>inject(GenreStation).genreId)
    genre: Relation;
}
