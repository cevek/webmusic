import {DAO} from "../lib/dao";
import {Genre, GenreDAO} from "./Genre";
import {Station, StationDAO} from "./Station";
export class GenreStation {
    id:number;
    genre:Genre;
    station:Station[];
}

export class GenreStationDAO extends DAO<GenreStation> {
    table = 'genreStations';
    genre = this.addBelongsToRelation('genre', GenreDAO);
    station = this.addBelongsToRelation('station', StationDAO);

}
