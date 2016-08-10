import {DAO, HasMany, HasManyThrough, HasOne} from "../lib/dao";
import {GenreStation} from "./GenreStation";
import {DB} from "../lib/db";
import {Genre} from "./Genre";
import {StationInfo} from "./StationInfo";
export class Station {
    id:number;
    name:string;

    @HasManyThrough(Genre, GenreStation)
    genres:Genre[];

    @HasOne(StationInfo)
    info: StationInfo;

    urls:string[];
    needToConvert:boolean;
}

export class StationDAO extends DAO<Station> {
    constructor(db: DB){
        super(db, 'stations', Station);
    }
}
