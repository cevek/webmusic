import {Config} from "./config";
export const config:Config = {
    db: {
        user: 'root',
        password: '',
        database: 'webmusic'
    },
    musicFilesDir: '/Users/cody/Downloads/webmusic/',
    maxCapacity: 1024 * 1024 * 1024,
    limitConcurentProcess: 10,
};