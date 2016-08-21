import {Base} from "./Base";
import {DataSource} from "./DataSource";
import {Expression} from "./Expression";
import {QueryValues} from "../query";
import {toSql} from "./common";

/**
 * UPDATE [LOW_PRIORITY] [IGNORE] table_reference
 * SET col_name1={expr1|DEFAULT} [, col_name2={expr2|DEFAULT}] ...
 * [WHERE where_condition]
 * [ORDER BY ...]
 * [LIMIT row_count]
 */

export class Update extends Base {
    private _lowPriority: boolean = false;
    private _ignore: boolean = false;
    private _table: DataSource = null;
    private _set: Expression[] = null;
    private _orderBy: Expression[] = null;
    private _limit: number = null;

    lowPriority() {
        this._lowPriority = true;
        return this;
    }

    ignore() {
        this._ignore = true;
        return this;
    }

    table(table: DataSource) {
        this._table = table;
        return this;
    }

    set(expr: Expression | Expression[]) {
        this._set = expr instanceof Array ? expr : [expr];
        return this;
    }

    orderBy(expr: Expression | Expression[]) {
        this._orderBy = expr instanceof Array ? expr : [expr];
        return this;
    }

    limit(limit: number) {
        this._limit = limit;
        return this;
    }

    toSQL(values: QueryValues) {
        let sql = 'UPDATE';
        if (this._lowPriority) {
            sql += ' LOW PRIORITY'
        }
        if (this._ignore) {
            sql += ' IGNORE'
        }
        if (this._table) {
            sql += ' ' + toSql(this._table, values);
        }
        if (this._set && this._set.length) {
            sql += ' SET ' + this._set.map(expr => toSql(expr, values)).join(', ');
        }
        if (this._orderBy && this._orderBy.length) {
            sql += ' ORDER BY ' + this._orderBy.map(expr => toSql(expr, values)).join(', ');
        }
        if (this._limit) {
            sql += ` LIMIT ${toSql(this._limit, values)}`;
        }
        return sql;
    }

}