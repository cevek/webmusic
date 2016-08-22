import {DAO, field, hasManyThrough, Relation} from "../lib/dao";
import {Station} from "./Station";
import {GenreStation} from "./GenreStation";
import {Field} from "../lib/sql/DataSource";
import {inject} from "../lib/injector";

export interface GenreEntity {
    id:number;
    name:string;
    stations:Station[];
}

export class Genre extends DAO<GenreEntity> {
    @field name: Field;

    @hasManyThrough(()=>inject(GenreStation).station, ()=>inject(GenreStation).stationId)
    stations: Relation;
}
