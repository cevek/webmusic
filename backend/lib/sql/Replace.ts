import {Base, Raw, QueryValues} from "./Base";
import {DataSource} from "./DataSource";
import {Expression} from "./Expression";
import {toSql, toArray} from "./common";
import {Identifier} from "./Identifier";
import {SelectQuery} from "./SelectQuery";

/**
 * Syntax:
 *     REPLACE [LOW_PRIORITY | DELAYED]
 *     [INTO] tbl_name
 *          [PARTITION (partition_name,...)]
 *     [(col_name,...)]
 *     {VALUES | VALUE} ({expr | DEFAULT},...),(...),...
 *
 * Or:
 *
 *     REPLACE [LOW_PRIORITY | DELAYED]
 *     [INTO] tbl_name
 *          [PARTITION (partition_name,...)]
 *     SET col_name={expr | DEFAULT}, ...
 *
 * Or:
 *     REPLACE [LOW_PRIORITY | DELAYED]
 *     [INTO] tbl_name
 *          [PARTITION (partition_name,...)]
 *     [(col_name,...)]
 *     SELECT ...
 */

export class ReplaceParams {
    lowPriority?: boolean = false;
    delayed?: boolean = false;
    into?: DataSource = null;
    object?: {} = null;
    cols?: Identifier | Identifier[] = null;
    values?: (Expression | Raw)[][] = null;
    set?: Expression | Expression[] = null;
    select?: SelectQuery = null;
}

export class Replace extends Base {
    private params = new ReplaceParams();

    constructor() {
        super();
    }

    fromParams(params: ReplaceParams) {
        return new Replace()
            .lowPriority(params.lowPriority)
            .delayed(params.delayed)
            .into(params.into)
            .object(params.object)
            .cols(params.cols)
            .values(params.values)
            .set(params.set)
            .select(params.select)
    }

    lowPriority(state: boolean) {
        this.params.lowPriority = state;
        return this;
    }

    delayed(state: boolean) {
        this.params.delayed = state;
        return this;
    }

    into(table: DataSource) {
        this.params.into = table;
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

    cols(cols: Identifier | Identifier[]) {
        if (cols) {
            this.params.cols = cols;
        }
        return this;
    }

    values(values: (Expression | Raw)[][]) {
        if (values) {
            this.params.values = values;
        }
        return this;
    }

    select(query: SelectQuery) {
        this.params.select = query;
        return this;
    }

    toSQL(values: QueryValues) {
        let sql = 'REPLACE';
        //todo: handle empty array
        if (this.params.lowPriority) {
            sql += ' LOW_PRIORITY'
        }
        if (this.params.delayed) {
            sql += ' DELAYED'
        }
        if (this.params.into) {
            sql += ' INTO ' + toSql(this.params.into, values);
        }
        if (this.params.cols) {
            sql += ` (${toArray(this.params.cols, values, ', ')})`;
        }
        if (this.params.set) {
            sql += ' SET ' + toArray(this.params.set, values, ', ');
        }
        if (this.params.values) {
            sql += ' VALUES ' + toSql(this.params.values as {} as Raw[], values);
        }
        if (this.params.select) {
            sql += ' ' + toSql(this.params.select, values);
        }
        return sql;
    }
}