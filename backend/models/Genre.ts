import {DAO} from "../lib/dao";
import {Station} from "./Station";
import {GenreStation} from "./GenreStation";
import {Table} from "../lib/query";


export interface GenreEntity {
    id:number;
    name:string;
    stations:Station[];
}

export class Genre extends DAO<GenreEntity> {
    static table = new Table('Genre');
    static id = Genre.field('id');
    static Name = Genre.field('name');

    static get rel() {
        return {
            stations: Genre.hasManyThrough(GenreStation.rel.station, GenreStation.stationId, 'stations')
        }
    }
}
