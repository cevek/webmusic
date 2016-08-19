import {spawn, ChildProcess} from "child_process";
import {StationEntity, Station} from "../models/Station";
import {Track} from "../models/Track";
import {inject} from "../lib/injector";
import {Logger} from "../lib/Logger";
import {radioServices} from "./RadioService";
import {statSync} from "fs";
import {Config} from "../config";

interface RecordResult {
    info:string;
    duration:number;
    breaks:number;
    error:boolean;
    size:number;
}
let id = 0;
export class Recorder {
    id = ++id;
    ffmpeg:ChildProcess;
    timeout:NodeJS.Timer;
    globTimeout:NodeJS.Timer;
    station:StationEntity;
    filename:string;
    fullFilename:string;
    config = inject(Config);
    stationDAO = inject(Station);
    track = inject(Track);

    logger = inject(Logger);

    maxPauseBreak = 10000;
    maxTimeout:number;

    constructor(station:StationEntity) {
        this.maxTimeout = this.config.trackDuration * 1500 + 30000;
        this.station = station;
        this.filename = `${radioServices.get(station.owner).name}_${station.slug}_${(Date.now() / 1000 | 0)}.mp4`;
        this.fullFilename = this.config.musicFilesDir + this.filename;
    }

    async start() {
        this.logger.log('Recording', this.id, this.station.slug);
        try {
            const trackId = await this.track.create({
                id: null,
                stationId: this.station.id,
                lastUsedAt: null,
                filename: this.filename,
                duration: 0,
                createdAt: new Date(),
                endedAt: null,
                info: null,
                error: 0,
                breaks: 0,
                size: 0,
            });

            const result = await this.record();

            await this.track.update({
                id: void 0,
                stationId: void 0,
                lastUsedAt: void 0,
                filename: void 0,
                duration: result.duration,
                createdAt: void 0,
                endedAt: new Date(),
                info: result.info,
                error: result.error ? 1 : 0,
                breaks: result.breaks,
                size: result.size
            }, trackId);

            await this.stationDAO.updateCustom({
                set: Station.recording.assign(false),
                where: Station.id.equal(this.station.id)
            })

        } catch (e) {
            this.logger.error(e);
        }
        this.logger.log('Record done', this.id, this.station.slug);

    }

    private parseLastTime(s:string) {
        const regFFMPEG = /time=(\d+):(\d+):(\d+)\.(\d{2})/g;
        let res:RegExpMatchArray;
        let lastRes:RegExpMatchArray;
        while (res = regFFMPEG.exec(s)) {
            lastRes = res;
        }
        if (lastRes) {
            return Math.round(+lastRes[1] * 3600 + +lastRes[2] * 60 + +lastRes[3] + +lastRes[4] / 100);
        }
        const regAvconv = /time=(\d+)\.(\d{2})/g;
        while (res = regAvconv.exec(s)) {
            lastRes = res;
        }
        if (lastRes) {
            return Math.round(+lastRes[1] + +lastRes[2] / 100);
        }
        return 0;
    }

    private getFileSize() {
        try {
            return statSync(this.fullFilename).size;
        } catch (e) {

        }
        return 0;
    }

    private record() {
        return new Promise<RecordResult>((resolve) => {
            let error = false;
            let info = '';
            let breaks = 0;
            const url = this.station.url;
            const options = {};
            const args:string[] = [];
            args.push('-i', `${url}`, '-y', '-t', this.config.trackDuration.toString()/*, '-bsf:a', 'aac_adtstoasc'*/);
            if (this.station.cover) {
                // args.push('-i', `"${station.cover}"`, '-c copy -map 1');
            }
            args.push('-c:a', 'libfdk_aac', '-profile:a', 'aac_he_v2', '-b:a', '32k');
            args.push(this.fullFilename);

            // this.logger.log('Start process', 'ffmpeg ' + args.join(' '));

            this.ffmpeg = spawn(`ffmpeg`, args, options);

            const abort = (reason:string)=> {
                try {
                    this.logger.log('abort', reason, this.id, this.station.slug);
                    this.ffmpeg.kill('SIGKILL');
                    error = true;
                    info += + '\nAborted: ' + reason;
                } catch (e) {
                    this.logger.error(e);
                }
            };

            this.ffmpeg.stderr.on('data', (data:Buffer) => {
                // this.logger.log('ondata', this.station.slug);
                info += data.toString();
                clearTimeout(this.timeout);
                this.timeout = setTimeout(()=>abort(`timeout ${this.maxPauseBreak}ms`), this.maxPauseBreak);
            });
            this.ffmpeg.stderr.on('end', () => {
                try {
                    const duration = this.parseLastTime(info);
                    clearTimeout(this.timeout);
                    clearTimeout(this.globTimeout);
                    resolve({
                        info,
                        breaks,
                        duration,
                        size: this.getFileSize(),
                        error: error || duration < this.config.trackDuration
                    });
                } catch (e) {
                    this.logger.error(e);
                }
            });
            this.globTimeout = setTimeout(() => {
                abort(`Glob timeout: ${this.maxTimeout}`);
            }, this.maxTimeout);

        });
    }
}
