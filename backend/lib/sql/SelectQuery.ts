import {Statement} from "./Base";
import {Expression, LeftExpression, ExpressionTypes} from "./Expression";
import {DataSource, RawSQL} from "./DataSource";
import {QueryValues} from "../query";
import {Identifier} from "./Identifier";
import {Procedure} from "./Procedure";
import {toSql} from "./common";

/**
 * SELECT
 *     [ALL | DISTINCT | DISTINCTROW]
 *     [HIGH_PRIORITY]
 *     [MAX_STATEMENT_TIME = N]
 *     [STRAIGHT_JOIN]
 *     [SQL_SMALL_RESULT]
 *     [SQL_BIG_RESULT]
 *     [SQL_BUFFER_RESULT]
 *     [SQL_CACHE | SQL_NO_CACHE]
 *     [SQL_CALC_FOUND_ROWS]
 * select_expr [, select_expr ...]
 * [FROM table_references
 *     [PARTITION partition_list]
 * [WHERE where_condition]
 * [GROUP BY {col_name | expr | position}
 *      [ASC | DESC], ... [WITH ROLLUP]]
 * [HAVING where_condition]
 * [ORDER BY {col_name | expr | position}
 *     [ASC | DESC], ...]
 * [LIMIT {[offset,] row_count | row_count OFFSET offset}]
 * [PROCEDURE procedure_name(argument_list)]
 * [INTO OUTFILE 'file_name'
 *     [CHARACTER SET charset_name]
 *      export_options
 *      | INTO DUMPFILE 'file_name'
 *      | INTO var_name [, var_name]]
 * [FOR UPDATE | LOCK IN SHARE MODE]]
 */


export class SelectQuery extends Statement {
    private _directives: SelectDirective[] = null;
    private _attrs: Expression[] = null;
    private _from: DataSource[] = null;
    private _where: Expression[] = null;
    private _groupBy: Expression[] = null;
    private _groupByWithRollup: boolean = null;
    private _having: Expression[] = null;
    private _orderBy: Expression[] = null;
    private _limit: number = null;
    private _offset: number = null;
    private _into: Identifier[] = null;
    private _procedure: Procedure = null;
    private _forUpdate: boolean = null;
    private _lockInShareMode: boolean = null;
    private _union: SelectQuery = null;
    private _unionAll: boolean = null;

    constructor() {
        super();
    }

    attrs(attrs: Expression | Expression[]) {
        this._attrs = attrs instanceof Array ? attrs : [attrs];
        return this;
    }

    directives(directives: SelectDirective | SelectDirective[]) {
        this._directives = directives instanceof Array ? directives : [directives];
    }

    from(table: DataSource | DataSource[]) {
        this._from = table instanceof Array ? table : [table];
        return this;
    }

    where(expr: Expression | Expression[]) {
        this._where = expr instanceof Array ? expr : [expr];
        return this;
    }

    groupBy(expr: Expression | Expression[], withRollup?: boolean) {
        this._groupBy = expr instanceof Array ? expr : [expr];
        this._groupByWithRollup = withRollup;
        return this;
    }

    having(expr: Expression | Expression[]) {
        this._having = expr instanceof Array ? expr : [expr];
        return this;
    }

    orderBy(expr: Expression | Expression[]) {
        this._orderBy = expr instanceof Array ? expr : [expr];
        return this;
    }

    limit(limit: number, offset?: number) {
        this._limit = limit;
        this._offset = offset;
        return this;
    }

    procedure(procedure: Procedure) {
        this._procedure = procedure;
        return this;
    }

    into(expr: Identifier | Identifier[]) {
        this._into = expr instanceof Array ? expr : [expr];
        return this;
    }

    forUpdate(state = true) {
        this._forUpdate = state;
        return this;
    }

    lockInShareMode(state = true) {
        this._lockInShareMode = state;
        return this;
    }

    union(select: SelectQuery, all?: boolean) {
        this._union = select;
        this._unionAll = all;
    }

    toExpression() {
        return new LeftExpression(ExpressionTypes.BRACKETS, this as Object as Expression);
    }

    toSQL(values: QueryValues) {
        let sql = 'SELECT';
        if (this._directives && this._directives.length) {
            sql += ' ' + this._directives.map(dir => toSql(new RawSQL(SelectDirective[dir]), null)).join(' ');
        }
        if (this._attrs && this._attrs.length) {
            sql += ' ' + this._attrs.map(attr => toSql(attr, values)).join(', ');
        } else {
            sql += ' *';
        }
        if (this._from && this._from.length) {
            sql += ' FROM ' + this._from.map(ds => toSql(ds, values)).join(', ');
        }
        if (this._where && this._where.length) {
            sql += ' WHERE ' + this._where.map(expr => toSql(expr, values)).join(' AND ');
        }
        if (this._groupBy && this._groupBy.length) {
            sql += ' GROUP BY ' + this._groupBy.map(expr => toSql(expr, values)).join(', ');
            if (this._groupByWithRollup) {
                sql += ' WITH ROLLUP';
            }
        }
        if (this._having && this._having.length) {
            sql += ' HAVING ' + this._having.map(expr => toSql(expr, values)).join(' AND ');
        }
        if (this._orderBy && this._orderBy.length) {
            sql += ' ORDER BY ' + this._orderBy.map(expr => toSql(expr, values)).join(', ');
        }
        if (this._limit) {
            sql += ` LIMIT ${toSql(this._offset || 0, values)}, ${toSql(this._limit, values)}`;
        }
        if (this._forUpdate) {
            sql += ' FOR UPDATE'
        }
        if (this._lockInShareMode) {
            sql += ' LOCK IN SHARE MODE'
        }
        if (this._procedure) {
            sql += ' PROCEDURE ' + toSql(this._procedure, values);
        }
        if (this._into && this._into.length) {
            sql += ' INTO ' + this._into.map(v => toSql(v, values)).join(', ');
        }
        if (this._union) {
            sql = `(${sql}) UNION ${this._unionAll ? 'ALL ' : ' '}(${toSql(this._union, values)})`
        }
        return sql;
    }
}

export enum SelectDirective{
    ALL,
    DISTINCT,
    DISTINCTROW,
    HIGH_PRIORITY,
    MAX_STATEMENT_TIME,
    STRAIGHT_JOIN,
    SQL_SMALL_RESULT,
    SQL_BIG_RESULT,
    SQL_BUFFER_RESULT,
    SQL_CACHE,
    SQL_NO_CACHE,
    SQL_CALC_FOUND_ROWS,
}
