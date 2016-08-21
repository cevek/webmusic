import {QueryValues, Statement} from "./Base";
import {DataSource} from "./DataSource";
import {Expression} from "./Expression";
import {toSql, toArray} from "./common";
`
DELETE [LOW_PRIORITY] [QUICK] [IGNORE] 
    FROM tbl_name
        [PARTITION (partition_name,...)]
    [WHERE where_condition]
    [ORDER BY ...]
    [LIMIT row_count]
`

export class DeleteParams {
    lowPriority?: boolean = false;
    ignore?: boolean = false;
    quick?: boolean = false;
    from?: DataSource = null;
    where?: Expression | Expression[] = null;
    orderBy?: Expression | Expression[] = null;
    limit?: number = null;
}

export class Delete extends Statement {
    private params = new DeleteParams();

    constructor() {
        super();
    }

    fromParams(params: DeleteParams) {
        return new Delete()
            .lowPriority(params.lowPriority)
            .ignore(params.ignore)
            .quick(params.quick)
            .from(params.from)
            .where(params.where)
            .orderBy(params.orderBy)
            .limit(params.limit)
    }

    lowPriority(state: boolean) {
        this.params.lowPriority = state;
        return this;
    }

    ignore(state: boolean) {
        this.params.ignore = state;
        return this;
    }

    quick(state: boolean) {
        this.params.quick = state;
        return this;
    }

    from(table: DataSource) {
        this.params.from = table;
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
        let sql = 'DELETE';
        if (this.params.lowPriority) {
            sql += ' LOW_PRIORITY'
        }
        if (this.params.ignore) {
            sql += ' IGNORE'
        }
        if (this.params.ignore) {
            sql += ' QUICK'
        }
        if (this.params.from) {
            sql += ' FROM ' + toSql(this.params.from, values);
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