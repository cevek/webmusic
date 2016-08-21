import {DAO} from "../lib/dao";
import {Station} from "./Station";
import {GenreStation} from "./GenreStation";
import {SQL} from "../lib/sql/index";

export interface GenreEntity {
    id:number;
    name:string;
    stations:Station[];
}

export class Genre extends DAO<GenreEntity> {
    static table = SQL.table('Genre');
    static id = Genre.field('id');
    static Name = Genre.field('name');

    static get rel() {
        return {
            stations: Genre.hasManyThrough(GenreStation.rel.station, GenreStation.stationId, 'stations')
        }
    }
}
