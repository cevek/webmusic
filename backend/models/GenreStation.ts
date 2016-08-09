import {DAO, HasMany, BelongsTo, BelongsToMany} from "../lib/dao";
import {Genre} from "./Genre";
import {Station} from "./Station";
import {DB} from "../lib/db";
export class GenreStation {
    id:number;

    @BelongsTo(Genre)
    genre:Genre;

    station:Station[];
}

export class GenreStationsDAO extends DAO<GenreStation> {
    constructor(db:DB) {
        super(db, 'genreStations', GenreStation);
    }

}
