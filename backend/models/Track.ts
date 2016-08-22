import {DAO, field, belongsTo, Relation} from "../lib/dao";
import {Station} from "./Station";
import {Field} from "../lib/sql/DataSource";
import {inject} from "../lib/injector";
export interface ITrack {
    id: number;
    stationId: number;
    filename: string;
    duration: number;
    lastUsedAt: Date;
    info: string;
    createdAt: Date;
    endedAt: Date;
    error: number;
    breaks: number;
    size: number;
}

export class Track extends DAO<ITrack> {
    @field stationId: Field;
    @field filename: Field;
    @field duration: Field;
    @field lastUsedAt: Field;
    @field info: Field;
    @field createdAt: Field;
    @field endedAt: Field;
    @field error: Field;
    @field breaks: Field;
    @field size: Field;

    @belongsTo(()=>inject(Station).id, ()=>inject(Track).stationId)
    station: Relation;
}