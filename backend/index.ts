require('source-map-support').install();

import {Recorder} from "./services/Recorder";
import {Station} from "./models/Station";
import {Genre} from "./models/Genre";
import {genre, genreStations, station} from "./models/index";
import {GenreStation} from "./models/GenreStation";
function runTasks() {
    const recorder = new Recorder();
    /*  const chillout = new Genre({
     id: 1,
     name: 'Chillout'
     });
     const station = new Station({
     id: 1,
     name: 'Chill Tropical',
     genres: [chillout],
     needToConvert: true,
     urls: ['http://prem1.di.fm/chillntropicalhouse?52a6b929ebed9df2d9'],
     });*/
    const trackId = Math.random().toString(16).substr(2, 5);
    /*recorder.start(station, 200, `/Users/cody/Downloads/dmusic/${trackId}.aac`).then((data)=> {
     console.log(data);
     })*/
}
station.findAll({include: [{model: GenreStation, params: {include: [{model: Genre}]}}]}).then(data => {
    console.log(JSON.stringify(data, null, 3));
}).catch(err => console.error(err instanceof Error ? err.stack : err));
/*

genreStations.findAll({include: [{model: Genre}]}).then(data => {
    console.log(data);
}).catch(err => console.error(err instanceof Error ? err.stack : err));
*/


/*
station.findAll({include: [{model: GenreStation}]}).then(data => {
    console.log('res', data);
}).catch(err => console.error(err instanceof Error ? err.stack : err));
*/

// runTasks();