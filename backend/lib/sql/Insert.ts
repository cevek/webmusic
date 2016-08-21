import {Base, RawValue, Raw} from "./Base";
import {DataSource} from "./DataSource";
import {Expression} from "./Expression";
import {QueryValues} from "../query";
import {toSql} from "./common";
import {Identifier} from "./Identifier";
import {SelectQuery} from "./SelectQuery";

`
INSERT [LOW_PRIORITY | DELAYED | HIGH_PRIORITY] [IGNORE]
    [INTO] tbl_name
         [PARTITION (partition_name,...)] 
    [(col_name,...)]
    {VALUES | VALUE} ({expr | DEFAULT},...),(...),...
    [ ON DUPLICATE KEY UPDATE
      col_name=expr
        [, col_name=expr] ... ]

Or:

INSERT [LOW_PRIORITY | DELAYED | HIGH_PRIORITY] [IGNORE]
    [INTO] tbl_name
        [PARTITION (partition_name,...)]
    SET col_name={expr | DEFAULT}, ...
    [ ON DUPLICATE KEY UPDATE
      col_name=expr
        [, col_name=expr] ... ]

Or:

INSERT [LOW_PRIORITY | HIGH_PRIORITY] [IGNORE]
    [INTO] tbl_name
        [PARTITION (partition_name,...)] 
    [(col_name,...)]
    SELECT ...
    [ ON DUPLICATE KEY UPDATE
      col_name=expr
        [, col_name=expr] ... ]

`

export class Replace extends Base {
    private _lowPriority: boolean = false;
    private _delayed: boolean = false;
    private _highPriority: boolean = false;
    private _ignore: boolean = false;

    private _into: DataSource = null;
    private _cols: Identifier[] = null;
    private _values: (Expression | Raw)[][] = null;
    private _set: Expression[] = null;
    private _onDuplicateKeyUpdate: Expression[] = null;
    private _select: SelectQuery = null;

    lowPriority() {
        this._lowPriority = true;
        return this;
    }

    delayed() {
        this._delayed = true;
        return this;
    }

    highPriority() {
        this._highPriority = true;
        return this;
    }

    ignore() {
        this._ignore = true;
        return this;
    }

    into(table: DataSource) {
        this._into = table;
        return this;
    }

    set(expr: Expression | Expression[]) {
        this._set = expr instanceof Array ? expr : [expr];
        return this;
    }

    cols(identifiers: Identifier | Identifier[]) {
        this._cols = identifiers instanceof Array ? identifiers : [identifiers];
        return this;
    }

    values(values: (Expression | Raw)[][]) {
        this._values = values;
        return this;
    }

    onDuplicateKeyUpdate(expr: Expression | Expression[]) {
        this._onDuplicateKeyUpdate = expr instanceof Array ? expr : [expr];
        return this;
    }

    select(query: SelectQuery) {
        this._select = query;
        return this;
    }

    toSQL(values: QueryValues) {
        let sql = 'INSERT';
        if (this._lowPriority) {
            sql += ' LOW PRIORITY'
        }
        if (this._delayed) {
            sql += ' DELAYED'
        }
        if (this._highPriority) {
            sql += ' HIGH_PRIORITY'
        }
        if (this._ignore) {
            sql += ' IGNORE'
        }
        if (this._into) {
            sql += ' INTO ' + toSql(this._into, values);
        }
        if (this._cols && this._cols.length) {
            sql += ` (${this._cols.map(expr => toSql(expr, values)).join(', ')})`;
        }
        if (this._set && this._set.length) {
            sql += ' SET ' + this._set.map(expr => toSql(expr, values)).join(', ');
        }
        if (this._values && this._values.length) {
            sql += ' VALUES ' + toSql(this._values as {} as Raw[], values);
        }
        if (this._select) {
            sql += ' ' + toSql(this._select, values);
        }
        if (this._onDuplicateKeyUpdate) {
            sql += ' ON DUPLICATE KEY UPDATE ' + this._onDuplicateKeyUpdate.map(expr => toSql(expr, values)).join(', ');
        }
        return sql;
    }

}