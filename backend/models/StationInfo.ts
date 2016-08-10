import {DAO, HasMany, HasManyThrough, HasOne, BelongsTo} from "../lib/dao";
import {GenreStation} from "./GenreStation";
import {DB} from "../lib/db";
import {Genre} from "./Genre";
import {Station} from "./Station";
export class StationInfo {
    id:number;

    station:Station[];

    text:string;
}

export class StationInfoDAO extends DAO<StationInfo> {
    constructor(db:DB) {
        super(db, 'stationInfo', StationInfo);
    }
}
