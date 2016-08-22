import {DAO, field, hasMany, Relation} from "../lib/dao";
import {GenreStation} from "./GenreStation";
import {Genre} from "./Genre";
import {StationInfo} from "./StationInfo";
import {Track} from "./Track";
import {Field} from "../lib/sql/DataSource";
import {StationSimilar} from "./StationSimilar";
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

    @hasMany(()=>Track)
    tracks: Relation;

    @hasMany(()=>Genre, ()=>GenreStation)
    genre: Relation;

    //todo:
    @hasMany(()=>Station, ()=>StationSimilar)
    similar: Relation;
}
