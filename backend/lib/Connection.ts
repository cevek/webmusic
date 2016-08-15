import {IMySql, IPool} from "mysql";
import {inject} from "../lib/injector";
import {DBConfig} from "./DBConfig";
const mysql:IMySql = require('mysql2');

export class Connection {
    pool:IPool;
    config = inject(DBConfig);

    constructor() {
        const config = this.config;
        this.pool = mysql.createPool(config);
    }
}

export interface ResultSetHeader {
    fieldCount:number,
    affectedRows:number
    insertId:number,
    serverStatus:number,
    warningStatus:number
}