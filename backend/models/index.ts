import {IMySql} from "mysql";
import {config} from "../config";
import {DB} from "../lib/db";
import {StationDAO} from "./Station";
import {GenreDAO} from "./Genre";
import {GenreStationsDAO} from "./GenreStation";
import {StationInfoDAO} from "./StationInfo";
const mysql:IMySql = require('mysql2');

var pool = mysql.createPool({
    database: config.db.name,
    user: config.db.user,
    password: config.db.password
});

export const db = new DB(pool);

export const station = new StationDAO(db);
export const genre = new GenreDAO(db);
export const genreStations = new GenreStationsDAO(db);
export const stationInfo = new StationInfoDAO(db);
