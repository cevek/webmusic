import {DAO} from "../lib/dao";
import {GenreStation} from "./GenreStation";
import {Genre} from "./Genre";
import {StationInfo} from "./StationInfo";
import {Table} from "../lib/query";
import {Track} from "./Track";
import {StationSimilar} from "./StationSimilar";
export interface StationEntity {
    id:number;
    name:string;

    genres:Genre[];

    info:StationInfo;

    url:string;
    needToConvert:boolean;

    slug:string;
    cover:string;

    owner:number;
    foreignId:string;

    recording: boolean;
}

export class Station extends DAO<StationEntity> {
    static table = new Table('Station');
    static id = Station.field('id');

    static Name = Station.field('name');
    static url = Station.field('url');
    static needToConvert = Station.field('needToConvert');
    static slug = Station.field('slug');
    static cover = Station.field('cover');

    static owner = Station.field('owner');
    static foreignId = Station.field('foreignId');

    static recording = Station.field('recording');

    static get rel() {
        return {
            genreStations: Station.hasMany(GenreStation, GenreStation.stationId, 'genreStation'),
            genres: Station.hasManyThrough(GenreStation.rel.genre, GenreStation.stationId, 'genres'),
            tracks: Station.hasMany(Track, Track.stationId, 'tracks'),
            similar: Station.hasManyThrough(StationSimilar.rel.station2, StationSimilar.stationId1, 'similar'),
            info: Station.hasOne(StationInfo, StationInfo.stationId, 'info')
        }
    }
}
