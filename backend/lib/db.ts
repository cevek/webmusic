'use strict';
import {IMySql, IPool, IConnection} from "mysql";
import {Expression} from "./dao";
var mysql: IMySql = require('mysql2');

type Params = {[key: string]: string | number} | (string | number)[];

export const DBEscape = mysql.escape;

export class DB {
    constructor(protected pool: IPool) {}

    async query<T>(query:string, params?:Params, trx?:Transaction):Promise<T> {
        console.log(query, params);

        var connection = trx ? trx.connection : await this.getConnection();
        var res = await (new Promise<T>((resolve, reject)=> {
            if (query) {
                var q = connection.query(query, params, (err:Error, rows:T) => {
                    if (err) {
                        //Got a packet bigger than 'max_allowed_packet' bytes
                        if ((<any>err).errno == 1153) {
                            //todo: after this error all next queries is this connection freeze
                        }
                        err.message = err.message + '\n' + q.sql;
                        return reject(err);
                    }
                    resolve(rows);
                });
            } else {
                resolve(null);
            }
        }));
        if (!trx) {
            connection.release();
        }
        return res;
    }

    insertSql(table:string, values:any[]) {
        var keysSet = new Set();
        for (var i = 0; i < values.length; i++) {
            for (var field in values[i]) {
                keysSet.add(field);
            }
        }
        var keys = [...keysSet.values()];
        var arrValues:string[][] = [];
        for (var value of values) {
            var arrValue:string[] = [];
            for (var key of keys) {
                arrValue.push(mysql.escape(value[key]));
            }
            arrValues.push(arrValue);
        }
        return arrValues.length === 0 ? '' : `INSERT INTO \`${table}\` (${keys.map(
            k => `\`${k}\``).join(", ")}) VALUES (${arrValues.map(
            v => `${v.join(", ")}`).join("), (")});`;
    }

    updateSql(table: string, values: any, where: string) {
        let setValues = '';
        for (const key in values) {
            setValues += `${key} = ${mysql.escape(values[key])}`;
        }
        return `UPDATE \`${table}\` SET ${setValues} WHERE ${where}`;
    }

    whereSql(params:any) {
        if (params instanceof Expression) {
            return params.toSQL();
        }
        if (params && typeof params == 'object') {
            var conditions = Object.keys(params)
                .map(k => `${k} ${params[k] === null ? 'IS' : '='} ${mysql.escape(params[k])}`);
            return conditions.length > 0 ? ('WHERE ' + conditions.join(' AND ')) : ''
        }
        if (typeof params == 'string') {
            return params;
        }
        return '';
    }

    async queryOne<T>(query:string, params?:any, trx?:Transaction) {
        return (await this.query<T[]>(query, params, trx))[0];
    }

    async queryAll<T>(query:string, params?:any, trx?:Transaction) {
        return (await this.query<T[]>(query, params, trx)) || [];
    }

    async transaction(fn:(transaction:Transaction)=>Promise<any>) {
        var transaction = await this.beginTransaction();
        try {
            await fn(transaction);
            await transaction.commit();
        }
        catch (e) {
            await transaction.rollback();
            throw e;
        }
    }

    async beginTransaction():Promise<Transaction> {
        const trx = new Transaction(this);
        return await trx.begin();
    }

    async getConnection():Promise<any> {
        return await (new Promise((resolve, reject)=> {
            this.pool.getConnection((err:Error, connection:any) => {
                if (err) {
                    return reject(err);
                }
                connection.config.namedPlaceholders = true;
                resolve(connection);
            });
        }));
    }
}

export class Transaction {
    public connection:IConnection;

    constructor(public db:DB) {}

    async begin() {
        this.connection = await this.db.getConnection();
        await this.db.query<void>('START TRANSACTION', null, this);
        return this;
    }

    async commit() {
        await this.db.query<void>('COMMIT', null, this);
        return this;
    }

    async rollback() {
        await this.db.query<void>('ROLLBACK', null, this);
        return this;
    }
}


