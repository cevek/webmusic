import {Base, Procedure, Identifier} from "./Base";
import {Expression} from "./Expression";
import {DataSource} from "./DataSource";

/*
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


export class SelectQuery extends Base {
    private _directives: string[] = [];
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

    attrs(attrs: Expression | Expression[]) {
        this._attrs = attrs instanceof Array ? attrs : [attrs];
        return this;
    }

    directive = new SelectDirectives<SelectQuery>(this, this._directives);

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

    forUpdate() {
        this._forUpdate = true;
        return this;
    }

    lockInShareMode() {
        this._lockInShareMode = true;
        return this;
    }

    union(select: SelectQuery, all?: boolean) {
        this._union = select;
        this._unionAll = all;
    }

    toExpression() {
        return new Expression(this);
    }
}
export class SelectDirectives<T> {
    constructor(protected owner: T, protected directives: string[]) {}

    ALL() { return this._directive('ALL')}

    DISTINCT() { return this._directive('DISTINCT')}

    DISTINCTROW() { return this._directive('DISTINCTROW')}

    HIGH_PRIORITY() { return this._directive('HIGH_PRIORITY')}

    MAX_STATEMENT_TIME(val: number) { return this._directive('MAX_STATEMENT_TIME', val)}

    STRAIGHT_JOIN() { return this._directive('STRAIGHT_JOIN')}

    SQL_SMALL_RESULT() { return this._directive('SQL_SMALL_RESULT')}

    SQL_BIG_RESULT() { return this._directive('SQL_BIG_RESULT')}

    SQL_BUFFER_RESULT() { return this._directive('SQL_BUFFER_RESULT')}

    SQL_CACHE() { return this._directive('SQL_CACHE')}

    SQL_NO_CACHE() { return this._directive('SQL_NO_CACHE')}

    SQL_CALC_FOUND_ROWS() { return this._directive('SQL_CALC_FOUND_ROWS')}

    private _directive(name: string, val?: number) {
        this.directives.push(val ? name : `${name}=${val}`);
        return this.owner;
    }
}