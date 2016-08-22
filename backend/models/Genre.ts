import {DAO, field, Relation, hasMany} from "../lib/dao";
import {Station} from "./Station";
import {GenreStation} from "./GenreStation";
import {Field} from "../lib/sql/DataSource";

export interface GenreEntity {
    id: number;
    name: string;
    stations: Station[];
}

export class Genre extends DAO<GenreEntity> {
    @field name: Field;

    @hasMany(()=>Station, ()=>GenreStation)
    stations: Relation;
}
