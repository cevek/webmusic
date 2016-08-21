import {Statement, QueryValues} from "./Base";
import {DataSource} from "./DataSource";
import {Expression} from "./Expression";
import {toSql, toArray} from "./common";
import {Identifier} from "./Identifier";

/**
 * UPDATE [LOW_PRIORITY] [IGNORE] table_reference
 * SET col_name1={expr1|DEFAULT} [, col_name2={expr2|DEFAULT}] ...
 * [WHERE where_condition]
 * [ORDER BY ...]
 * [LIMIT row_count]
 */

export class UpdateParams {
    ignore?: boolean = false;
    lowPriority?: boolean = false;
    table?: DataSource = null;
    set?: Expression | Expression[] = null;
    object?: {} = null;
    where?: Expression | Expression[] = null;
    orderBy?: Expression | Expression[] = null;
    limit?: number = null;
}

export class Update extends Statement {
    private params = new UpdateParams();

    fromParams(params: UpdateParams) {
        return new Update()
            .ignore(params.ignore)
            .lowPriority(params.lowPriority)
            .table(params.table)
            .object(params.object)
            .where(params.where)
            .orderBy(params.orderBy)
            .limit(params.limit)
            .set(params.set)
    }

    lowPriority(state: boolean) {
        this.params.lowPriority = state;
        return this;
    }

    ignore(state: boolean) {
        this.params.ignore = state;
        return this;
    }

    table(table: DataSource) {
        this.params.table = table;
        return this;
    }

    set(expr: Expression | Expression[]) {
        if (expr) {
            this.params.set = expr;
        }
        return this;
    }

    object(obj: {}) {
        if (obj) {
            const setArr: Expression[] = [];
            for (const key in obj) {
                const value = obj[key];
                if (value !== void 0) {
                    setArr.push(new Identifier(key).assign(value));
                }
            }
            this.set(setArr);
        }
        return this;
    }

    where(expr: Expression | Expression[]) {
        this.params.where = expr;
        return this;
    }

    orderBy(expr: Expression | Expression[]) {
        this.params.orderBy = expr;
        return this;
    }

    limit(limit: number) {
        this.params.limit = limit;
        return this;
    }

    toSQL(values: QueryValues) {
        let sql = 'UPDATE';
        if (this.params.lowPriority) {
            sql += ' LOW_PRIORITY'
        }
        if (this.params.ignore) {
            sql += ' IGNORE'
        }
        if (this.params.table) {
            sql += ' ' + toSql(this.params.table, values);
        }
        if (this.params.set) {
            sql += ' SET ' + toArray(this.params.set, values, ', ');
        }
        if (this.params.where) {
            sql += ' WHERE ' + toArray(this.params.where, values, ' AND ');
        }
        if (this.params.orderBy) {
            sql += ' ORDER BY ' + toArray(this.params.orderBy, values, ', ');
        }
        if (this.params.limit) {
            sql += ` LIMIT ${toSql(this.params.limit, values)}`;
        }
        return sql;
    }
}