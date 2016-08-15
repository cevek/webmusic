import {spawn} from "child_process";
import {ChildProcess} from "child_process";
import {Station, StationEntity} from "../models/Station";
import {config} from "../config";
import {Track} from "../models/Track";
import {inject} from "../lib/injector";
import {Logger} from "../lib/Logger";

interface RecordResult {
    info:string;
    duration:number;
    breaks:number;
    error:boolean;
}
export class Recorder {
    ffmpeg:ChildProcess;
    timeout:NodeJS.Timer;
    globTimeout:NodeJS.Timer;
    station:StationEntity;
    duration:number;
    filename:string;
    logger = inject(Logger);


    maxPauseBreak = 5000;
    maxTimeout:number;

    constructor(station:StationEntity, duration:number) {
        this.maxTimeout = duration * 1500;
        this.station = station;
        this.duration = duration;
        this.filename = `${config.onwers[station.owner]}_${station.slug}_${(Date.now() / 1000 | 0)}.mp4`;
    }

    async start() {
        this.logger.log('Recording', this.station.name);
        try {
            const trackDAO = inject(Track);
            const trackId = await trackDAO.create({
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
            });

            const result = await this.record();
            await trackDAO.update({
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
            }, trackId);

        } catch (e) {
            console.error(e.stack);
        }
    }

    parseLastTime(s:string) {
        const reg = /(\d+):(\d+):(\d+)\.(\d+)/g;
        let res:RegExpMatchArray;
        let lastRes:RegExpMatchArray;
        while (res = reg.exec(s)) {
            lastRes = res;
        }
        if (lastRes) {
            return +lastRes[1] * 3600 + +lastRes[2] * 60 + +lastRes[3]
        }
        return 0;
    }

    private record() {
        return new Promise<RecordResult>((resolve) => {
            const result = {
                info: '',
                breaks: 0,
                duration: 0,
                error: false
            }
            let info = '';
            const url = this.station.url;
            if (!url) {
                result.error = true;
                result.info = 'No Url';
                return resolve(result);
            }
            const options = {};
            const args:string[] = [];
            args.push('-i', `${url}`, '-y', '-t', this.duration.toString(), '-bsf:a', 'aac_adtstoasc');
            if (this.station.cover) {
                // args.push('-i', `"${station.cover}"`, '-c copy -map 1');
            }
            if (this.station.needToConvert) {
                args.push('-c:a', 'libfdk_aac', '-profile:a', 'aac_he_v2', '-b:a 32k');
            } else {
                args.push('-c:a', 'copy');
            }
            args.push(`${(config.musicFilesDir + this.filename)}`);

            // this.logger.log('Start process', 'ffmpeg ' + args.join(' '));

            this.ffmpeg = spawn(`ffmpeg`, args, options);

            const abort = (reason:string)=> {
                clearTimeout(this.timeout);
                clearTimeout(this.globTimeout);
                this.ffmpeg.kill('SIGKILL');
                info += '\nAborted: ' + reason;
                result.error = true;
                result.info = info;
                result.duration = this.parseLastTime(info);
                return resolve(result);
            };
            let timeout:NodeJS.Timer;

            this.ffmpeg.stderr.on('data', (data:Buffer) => {
                info += data.toString();
                clearTimeout(timeout);
                timeout = setTimeout(()=>abort(`timeout ${this.maxPauseBreak}ms`), this.maxPauseBreak);
            });
            this.ffmpeg.stderr.on('end', () => {
                result.info = info;
                result.duration = this.parseLastTime(info);
                result.error = result.duration == 0;
                return resolve(result);
                // console.log('stderr end');
            });
            this.globTimeout = setTimeout(() => {
                abort(`Glob timeout: ${this.maxTimeout}`);
            }, this.maxTimeout);

        });
    }
}
