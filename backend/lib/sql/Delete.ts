import {QueryValues, Statement} from "./Base";
import {DataSource} from "./DataSource";
import {Expression} from "./Expression";
import {toSql} from "./common";
`
DELETE [LOW_PRIORITY] [QUICK] [IGNORE] 
    FROM tbl_name
        [PARTITION (partition_name,...)]
    [WHERE where_condition]
    [ORDER BY ...]
    [LIMIT row_count]
`
export class Delete extends Statement {
    private _lowPriority: boolean = false;
    private _ignore: boolean = false;
    private _quick: boolean = false;
    private _from: DataSource = null;
    private _where: Expression[] = null;
    private _orderBy: Expression[] = null;
    private _limit: number = null;

    constructor() {
        super();
    }

    lowPriority(state = true) {
        this._lowPriority = state;
        return this;
    }

    ignore(state = true) {
        this._ignore = state;
        return this;
    }

    quick(state = true) {
        this._quick = state;
        return this;
    }

    from(table: DataSource) {
        this._from = table;
        return this;
    }

    where(expr: Expression | Expression[]) {
        this._where = expr instanceof Array ? expr : [expr];
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
        if (this._ignore) {
            sql += ' QUICK'
        }
        if (this._from) {
            sql += ' FROM ' + toSql(this._from, values);
        }
        if (this._where && this._where.length) {
            sql += ' WHERE ' + this._where.map(expr => toSql(expr, values)).join(' AND ');
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