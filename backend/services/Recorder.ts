import {spawn} from "child_process";
import {ChildProcess} from "child_process";
import {Station, StationEntity} from "../models/Station";
export class Recorder {
    ffmpeg:ChildProcess;
    timeout:NodeJS.Timer;

    start(station:StationEntity, duration:number, filename:string) {
        return new Promise((resolve) => {
            const url = station.url;
            if (!url) {
                return resolve();
            }
            const options = {};
            const args:string[] = [];
            args.push('-i', url, '-t', duration.toString());
            if (station.needToConvert) {
                // args.push('-c:a', 'libfdk_aac', '-profile:a', 'aac_he_v2', '-b:a', '32k');
            }
            args.push(filename);
            this.ffmpeg = spawn(`ffmpeg`, args, options);

            const abort = ()=> {
                this.ffmpeg.kill('SIGKILL');
                return resolve();
            };
            let timeout:NodeJS.Timer;

            this.ffmpeg.stderr.on('data', (data:Buffer) => {
                console.log('stderr data', data.toString());
                clearTimeout(timeout);
                timeout = setTimeout(abort, 5000);
            });
            this.ffmpeg.stderr.on('end', () => {
                console.log('stderr end');
            });
        });
    }
}
