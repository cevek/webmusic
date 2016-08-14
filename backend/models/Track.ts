import {DAO} from "../lib/dao";
import {Station} from "./Station";
import {Table} from "../lib/query";
export interface ITrack {
    id:number;
    stationId:number;
    filename:string;
    duration:number;
    lastUsedAt:Date;
    createdAt:Date;
}

export class Track extends DAO<ITrack> {
    static table = new Table('Track');
    static id = Track.field('id');

    static stationId = Track.field('stationId');
    static filename = Track.field('filename')
    static duration = Track.field('duration')
    static lastUsedAt = Track.field('lastUsedAt')
    static createdAt = Track.field('createdAt');

    static get rel(){
        return {
            station: Track.belongsTo(Station, Track.stationId, 'station')
        }
    }
}