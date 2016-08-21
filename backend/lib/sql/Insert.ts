import {Raw, QueryValues, Statement} from "./Base";
import {DataSource} from "./DataSource";
import {Expression} from "./Expression";
import {toSql, toArray} from "./common";
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
export class InsertParams {
    lowPriority?: boolean = false;
    delayed?: boolean = false;
    highPriority?: boolean = false;
    ignore?: boolean = false;

    into?: DataSource = null;
    cols?: Identifier | Identifier[] = null;
    values?: (Expression | Raw)[][] = null;
    set?: Expression | Expression[] = null;
    onDuplicateKeyUpdate?: Expression | Expression[] = null;
    select?: SelectQuery = null;
}

export class Insert extends Statement {
    params = new InsertParams();

    constructor() {
        super();
    }

    fromParams(params: InsertParams) {
        return new Insert()
            .lowPriority(params.lowPriority)
            .delayed(params.delayed)
            .highPriority(params.highPriority)
            .ignore(params.ignore)

            .into(params.into)
            .cols(params.cols)
            .values(params.values)
            .set(params.set)
            .onDuplicateKeyUpdate(params.onDuplicateKeyUpdate)
            .select(params.select)
    }


    lowPriority(state = true) {
        this.params.lowPriority = state;
        return this;
    }

    delayed(state = true) {
        this.params.delayed = state;
        return this;
    }

    highPriority(state = true) {
        this.params.highPriority = state;
        return this;
    }

    ignore(state = true) {
        this.params.ignore = state;
        return this;
    }

    into(table: DataSource) {
        this.params.into = table;
        return this;
    }

    set(expr: Expression | Expression[]) {
        this.params.set = expr;
        return this;
    }

    objects(obj: {}) {
        //todo
        return this;
    }

    cols(identifiers: Identifier | Identifier[]) {
        this.params.cols = identifiers;
        return this;
    }

    values(values: (Expression | Raw)[][]) {
        this.params.values = values;
        return this;
    }

    onDuplicateKeyUpdate(expr: Expression | Expression[]) {
        this.params.onDuplicateKeyUpdate = expr;
        return this;
    }

    select(query: SelectQuery) {
        this.params.select = query;
        return this;
    }

    toSQL(values: QueryValues) {
        let sql = 'INSERT';
        if (this.params.lowPriority) {
            sql += ' LOW PRIORITY'
        }
        if (this.params.delayed) {
            sql += ' DELAYED'
        }
        if (this.params.highPriority) {
            sql += ' HIGH_PRIORITY'
        }
        if (this.params.ignore) {
            sql += ' IGNORE'
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
        if (this.params.onDuplicateKeyUpdate) {
            sql += ' ON DUPLICATE KEY UPDATE ' + toArray(this.params.onDuplicateKeyUpdate, values, ', ');
        }
        return sql;
    }

}