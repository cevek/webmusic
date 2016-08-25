import {Station} from "./Station";
import {DAO, hasMany, field, Relation} from "../lib/tsorm/src/dao";
import {Field} from "../lib/tsorm/src/sql/DataSource";
import {GenreStation} from "./GenreStation";

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
