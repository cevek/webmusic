import {Station} from "./Station";
import {DAO, foreignKey, field, belongsTo, Relation} from "../lib/tsorm/src/dao";
import {Field} from "../lib/tsorm/src/sql/DataSource";
export interface ITrack {
    id?: number;
    stationId?: number;
    filename?: string;
    duration?: number;
    lastUsedAt?: Date;
    info?: string;
    createdAt?: Date;
    endedAt?: Date;
    error?: number;
    breaks?: number;
    size?: number;
}

export class Track extends DAO<ITrack> {
    @foreignKey(()=>Station)
    stationId: Field;

    @field filename: Field;
    @field duration: Field;
    @field lastUsedAt: Field;
    @field info: Field;
    @field createdAt: Field;
    @field endedAt: Field;
    @field error: Field;
    @field breaks: Field;
    @field size: Field;

    @belongsTo(()=>Station)
    station: Relation;
}