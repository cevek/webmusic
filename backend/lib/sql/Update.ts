import {Statement, QueryValues} from "./Base";
import {DataSource} from "./DataSource";
import {Expression} from "./Expression";
import {toSql, toArray} from "./common";

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
    value?: {} = null;
    where?: Expression | Expression[] = null;
    orderBy?: Expression | Expression[] = null;
    limit?: number = null;
}

export class Update extends Statement {
    private params = new UpdateParams();

    fromParams(params: UpdateParams){
        return new Update()
            .ignore(params.ignore)
            .lowPriority(params.lowPriority)
            .table(params.table)
            .object(params.value)
            .where(params.where)
            .orderBy(params.orderBy)
            .limit(params.limit)
            .set(params.set)
    }

    lowPriority(state = true) {
        this.params.lowPriority = state;
        return this;
    }

    ignore(state = true) {
        this.params.ignore = state;
        return this;
    }

    table(table: DataSource) {
        this.params.table = table;
        return this;
    }

    set(expr: Expression | Expression[]) {
        this.params.set = expr;
        return this;
    }

    object(obj: {}) {
        //todo
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
            sql += ' LOW PRIORITY'
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