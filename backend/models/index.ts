import {IMySql} from "mysql";
const mysql:IMySql = require('mysql2');

import {config} from '../config';
import {DB} from "../lib/db";
import {StationDAO} from "./Station";
import {GenreDAO} from "./Genre";
import {GenreStationsDAO} from "./GenreStation";

var pool = mysql.createPool({
    database: config.db.name,
    user: config.db.user,
    password: config.db.password
});

export const db = new DB(pool);

export const station = new StationDAO(db);
export const genre = new GenreDAO(db);
export const genreStations = new GenreStationsDAO(db);
