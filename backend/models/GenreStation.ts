import {DAO} from "../lib/dao";
import {Genre} from "./Genre";
import {Station, StationEntity} from "./Station";
import {SQL} from "../lib/sql/index";
export class GenreStationEntity {
    id:number;
    genre:Genre;
    station:StationEntity[];
}

export class GenreStation extends DAO<GenreStationEntity> {
    static table = SQL.table('GenreStation');
    static id = GenreStation.field('id');


    static genreId = GenreStation.field('genreId');
    static stationId = GenreStation.field('stationId');

    static get rel() {
        return {
            genre: GenreStation.belongsTo(Genre, GenreStation.genreId, 'genre'),
            station: GenreStation.belongsTo(Station, GenreStation.stationId, 'station'),
        }
    }
}
