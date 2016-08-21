import {Statement, QueryValues} from "./Base";
import {Expression, LeftExpression, ExpressionTypes} from "./Expression";
import {DataSource, RawSQL} from "./DataSource";
import {Identifier} from "./Identifier";
import {Procedure} from "./Procedure";
import {toSql, toArray} from "./common";

/**
 * SELECT
 *     [ALL | DISTINCT | DISTINCTROW]
 *     [HIGHPRIORITY]
 *     [MAXSTATEMENTTIME = N]
 *     [STRAIGHTJOIN]
 *     [SQLSMALLRESULT]
 *     [SQLBIGRESULT]
 *     [SQLBUFFERRESULT]
 *     [SQLCACHE | SQLNOCACHE]
 *     [SQLCALCFOUNDROWS]
 * selectexpr [, selectexpr ...]
 * [FROM tablereferences
 *     [PARTITION partitionlist]
 * [WHERE wherecondition]
 * [GROUP BY {colname | expr | position}
 *      [ASC | DESC], ... [WITH ROLLUP]]
 * [HAVING wherecondition]
 * [ORDER BY {colname | expr | position}
 *     [ASC | DESC], ...]
 * [LIMIT {[offset,] rowcount | rowcount OFFSET offset}]
 * [PROCEDURE procedurename(argumentlist)]
 * [INTO OUTFILE 'filename'
 *     [CHARACTER SET charsetname]
 *      exportoptions
 *      | INTO DUMPFILE 'filename'
 *      | INTO varname [, varname]]
 * [FOR UPDATE | LOCK IN SHARE MODE]]
 */


export class SelectParams {
    directives?: SelectDirective | SelectDirective[] = null;
    attrs?: Expression | Expression[] = null;
    from?: DataSource | DataSource[] = null;
    where?: Expression | Expression[] = null;
    groupBy?: Expression | Expression[] = null;
    groupByWithRollup?: boolean = null;
    having?: Expression | Expression[] = null;
    orderBy?: Expression | Expression[] = null;
    limit?: number = null;
    offset?: number = null;
    into?: Identifier | Identifier[] = null;
    procedure?: Procedure = null;
    forUpdate?: boolean = null;
    lockInShareMode?: boolean = null;
    union?: SelectQuery = null;
    unionAll?: boolean = null;
}

export class SelectQuery extends Statement {
    private params = new SelectParams();

    fromParams(params: SelectParams) {
        return new SelectQuery()
            .directives(params.directives)
            .attrs(params.attrs)
            .from(params.from)
            .where(params.where)
            .groupBy(params.groupBy, params.groupByWithRollup)
            .having(params.having)
            .orderBy(params.orderBy)
            .limit(params.limit, params.offset)
            .into(params.into)
            .procedure(params.procedure)
            .forUpdate(params.forUpdate)
            .lockInShareMode(params.lockInShareMode)
            .union(params.union, params.unionAll)
    }

    constructor() {
        super();
    }

    attrs(attrs: Expression | Expression[]) {
        this.params.attrs = attrs;
        return this;
    }

    directives(directives: SelectDirective | SelectDirective[]) {
        this.params.directives = directives;
        return this;
    }

    from(table: DataSource | DataSource[]) {
        this.params.from = table;
        return this;
    }

    where(expr: Expression | Expression[]) {
        this.params.where = expr;
        return this;
    }

    groupBy(expr: Expression | Expression[], withRollup = false) {
        this.params.groupBy = expr;
        this.params.groupByWithRollup = withRollup;
        return this;
    }

    having(expr: Expression | Expression[]) {
        this.params.having = expr;
        return this;
    }

    orderBy(expr: Expression | Expression[]) {
        this.params.orderBy = expr;
        return this;
    }

    limit(limit: number, offset?: number) {
        this.params.limit = limit;
        this.params.offset = offset;
        return this;
    }

    procedure(procedure: Procedure) {
        this.params.procedure = procedure;
        return this;
    }

    into(expr: Identifier | Identifier[]) {
        this.params.into = expr;
        return this;
    }

    forUpdate(state = true) {
        this.params.forUpdate = state;
        return this;
    }

    lockInShareMode(state = true) {
        this.params.lockInShareMode = state;
        return this;
    }

    union(select: SelectQuery, all = false) {
        this.params.union = select;
        this.params.unionAll = all;
        return this;
    }

    toExpression() {
        return new LeftExpression(ExpressionTypes.BRACKETS, this as Object as Expression);
    }

    toSQL(values: QueryValues) {
        let sql = 'SELECT';
        if (this.params.directives) {
            sql += ' ' + toArray(this.params.directives, values, ' ', d => new RawSQL(SelectDirective[d]));
        }
        if (this.params.attrs) {
            sql += ' ' + toArray(this.params.attrs, values, ', ');
        } else {
            sql += ' *';
        }
        if (this.params.from) {
            sql += ' FROM ' + toArray(this.params.from, values, ', ');
        }
        if (this.params.where) {
            sql += ' WHERE ' + toArray(this.params.where, values, ' AND ');
        }
        if (this.params.groupBy) {
            sql += ' GROUP BY ' + toArray(this.params.groupBy, values, ', ');
            if (this.params.groupByWithRollup) {
                sql += ' WITH ROLLUP';
            }
        }
        if (this.params.having) {
            sql += ' HAVING ' + toArray(this.params.having, values, ' AND ');
        }
        if (this.params.orderBy) {
            sql += ' ORDER BY ' + toArray(this.params.orderBy, values, ', ');
        }
        if (this.params.limit) {
            sql += ` LIMIT ${toSql(this.params.offset || 0, values)}, ${toSql(this.params.limit, values)}`;
        }
        if (this.params.forUpdate) {
            sql += ' FOR UPDATE'
        }
        if (this.params.lockInShareMode) {
            sql += ' LOCK IN SHARE MODE'
        }
        if (this.params.procedure) {
            sql += ' PROCEDURE ' + toSql(this.params.procedure, values);
        }
        if (this.params.into) {
            sql += ' INTO ' + toArray(this.params.into, values, ', ');
        }
        if (this.params.union) {
            sql = `(${sql}) UNION ${this.params.unionAll ? 'ALL ' : ' '}(${toSql(this.params.union, values)})`
        }
        return sql;
    }
}

export enum SelectDirective{
    ALL,
    DISTINCT,
    DISTINCTROW,
    HIGHPRIORITY,
    MAXSTATEMENTTIME,
    STRAIGHTJOIN,
    SQLSMALLRESULT,
    SQLBIGRESULT,
    SQLBUFFERRESULT,
    SQLCACHE,
    SQLNOCACHE,
    SQLCALCFOUNDROWS,
}
