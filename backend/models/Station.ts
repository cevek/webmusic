import {DAO, HasMany} from "../lib/dao";
import {GenreStation} from "./GenreStation";
import {DB} from "../lib/db";
export class Station {
    id:number;
    name:string;

    @HasMany(GenreStation)
    genres:GenreStation[];

    urls:string[];
    needToConvert:boolean;
}

export class StationDAO extends DAO<Station> {
    constructor(db: DB){
        super(db, 'stations', Station);
    }
}
