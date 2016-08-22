import {DAO, field, hasMany, Relation, hasManyThrough} from "../lib/dao";
import {GenreStation} from "./GenreStation";
import {Genre} from "./Genre";
import {StationInfo} from "./StationInfo";
import {Track} from "./Track";
import {StationSimilar} from "./StationSimilar";
import {Field} from "../lib/sql/DataSource";
import {inject} from "../lib/injector";
export interface StationEntity {
    id: number;
    name: string;

    genres: Genre[];

    info: StationInfo;

    url: string;

    slug: string;
    cover: string;

    owner: number;
    foreignId: string;
}

export class Station extends DAO<StationEntity> {
    @field name: Field;
    @field url: Field;
    @field slug: Field;
    @field cover: Field;

    @field owner: Field;
    @field foreignId: Field;

    @hasMany(()=>inject(Track).stationId)
    tracks: Relation;

    @hasManyThrough(()=>inject(GenreStation).genre, ()=>inject(GenreStation).stationId)
    genre: Relation;

    @hasManyThrough(()=>inject(StationSimilar).station2, ()=>inject(StationSimilar).stationId1)
    similar: Relation;
}
