import {inject} from "../lib/injector";
import {Track, ITrack} from "../models/Track";
import {readdirSync} from "fs";
import {config} from "../config";
import {unlinkSync} from "fs";
import {Logger} from "../lib/Logger";

export class FileSync {
    logger = new Logger(this.constructor.name);

    async sync() {
        const track = inject(Track);
        const tracks = await track.findAll({
            where: Track.error.equal(0),
            order: Track.filename
        });
        const tracksMap = new Map(tracks.map(t => [t.filename, t]) as [string, ITrack][]);
        const files = readdirSync(config.musicFilesDir).filter(f => f !== '.' && f !== '..');
        const filesMap = new Map(files.map(file => [file, file]) as [string, string][]);
        const removeFiles = files.filter(file => !tracksMap.has(file));
        const removeTracks = tracks.filter(track => !filesMap.has(track.filename));

        for (let i = 0; i < removeFiles.length; i++) {
            const file = removeFiles[i];
            this.logger.log('remove file', file);
            unlinkSync(config.musicFilesDir + file);
        }
        if (removeTracks.length) {
            await track.removeAll(removeTracks.map(t => t.id));
            this.logger.log('removed tracks', removeTracks.map(t => t.id));
        }
    }

    async setErrorToAllNonStoppedTracks() {
        const track = inject(Track);
        const affected = await track.updateCustom({
            set: Track.error.assign(1), //todo: , info: Track.info.plus('\nSet error after restart')
            where: Track.duration.equal(0).and(Track.error.equal(0))
        })
        if (affected > 0) {
            this.logger.log('set error to unstopped tracks', affected);
        }
    }

    async removeOldTracks(){
        await this.setErrorToAllNonStoppedTracks();
        //todo
    }
}