import {inject} from "../lib/injector";
import {Track, ITrack} from "../models/Track";
import {readdirSync} from "fs";
import {unlinkSync} from "fs";
import {Logger} from "../lib/Logger";
import {SQLFunctions} from "../lib/SQLFunctions";
import {Config} from "../config";
import {Station} from "../models/Station";

export class FileSync {
    logger = new Logger(this.constructor.name);
    track = inject(Track);
    station = inject(Station);
    config = inject(Config);

    async sync() {
        const tracks = await this.track.findAll({
            attributes: [Track.id, Track.filename],
            where: Track.error.equal(0),
            order: Track.filename
        }) as {id:number, filename:string}[];

        const tracksMap = new Map(tracks.map(t => [t.filename, t]) as [string, ITrack][]);
        const files = readdirSync(this.config.musicFilesDir).filter(f => f !== '.' && f !== '..');
        const filesMap = new Map(files.map(file => [file, file]) as [string, string][]);
        const removeFiles = files.filter(file => !tracksMap.has(file));
        const removeTracks = tracks.filter(track => !filesMap.has(track.filename));

        for (let i = 0; i < removeFiles.length; i++) {
            const file = removeFiles[i];
            this.logger.log('remove file', file);
            unlinkSync(this.config.musicFilesDir + file);
        }
        if (removeTracks.length) {
            await this.track.removeAll(removeTracks.map(t => t.id));
            this.logger.log('removed tracks', removeTracks.map(t => t.id));
        }
    }

    async removeNonStoppedTracks() {
        const affected = await this.track.removeCustom({
            where: Track.endedAt.isNull()
        })
        if (affected > 0) {
            this.logger.log('remove non stopped tracks', affected);
        }
    }

    async removeOldTracks() {
        const tracks = await this.track.findAll({
            attributes: [Track.id, Track.size],
            order: Track.createdAt.desc()
        }) as {id:number; size:number}[];

        let tracksToRemove:number[] = [];
        let currSize = 0;
        for (let i = 0; i < tracks.length; i++) {
            const track = tracks[i];
            currSize += track.size;
            if (currSize > this.config.maxCapacity) {
                tracksToRemove = tracks.slice(i).map(t => t.id);
                break;
            }
        }
        if (tracksToRemove.length) {
            await this.track.removeAll(tracksToRemove);
            this.logger.log('removed old tracks', tracksToRemove.length)
        }
        await this.sync();
    }
}