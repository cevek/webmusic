import {DAO} from "../lib/dao";
import {Station} from "./Station";
import {Table} from "../lib/query";
export interface ITrack {
    id:number;
    stationId:number;
    filename:string;
    duration:number;
    lastUsedAt:Date;
    info:string;
    createdAt:Date;
    endedAt:Date;
    error:number;
    breaks:number;
    size:number;
}

export class Track extends DAO<ITrack> {
    static table = new Table('Track');
    static id = Track.field('id');

    static stationId = Track.field('stationId');
    static filename = Track.field('filename')
    static duration = Track.field('duration')
    static lastUsedAt = Track.field('lastUsedAt')
    static info = Track.field('info')
    static createdAt = Track.field('createdAt');
    static endedAt = Track.field('endedAt');
    static error = Track.field('error');
    static breaks = Track.field('breaks');
    static size = Track.field('size');

    static get rel() {
        return {
            station: Track.belongsTo(Station, Track.stationId, 'station')
        }
    }
}