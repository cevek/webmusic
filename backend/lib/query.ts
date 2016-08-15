export type QueryValues = any[];

export interface Join {
    type?:'INNER' | 'LEFT' | 'OUTER';
    table:Expression;
    on:Expression;
}

export const ExpressionTypes = {
    EMPTY: {sql: '', count: 0},
    VAL: {sql: '$', count: 1},
    AS: {sql: '$ AS $', count: 2},
    ASSIGN: {sql: '$ = $', count: 2},

    AND: {sql: '$ AND $', count: 2},
    OR: {sql: '($ OR $)', count: 2},
    EQUAL: {sql: '$ = $', count: 2},
    NOT_EQUAL: {sql: '$ != $', count: 2},
    GT: {sql: '$ > $', count: 2},
    GTE: {sql: '$ >= $', count: 2},
    LT: {sql: '$ < $', count: 2},
    LTE: {sql: '$ <= $', count: 2},
    IN: {sql: '$ IN ($)', count: 2},
    NOT_IN: {sql: '$ NOT IN $', count: 2},
    BETWEEN: {sql: '$ BETWEEN $ AND $', count: 3},
    NOT_BETWEEN: {sql: '$ NOT BETWEEN $ AND $', count: 3},
    LIKE: {sql: '$ LIKE $', count: 2},
    NOT_LIKE: {sql: '$ NOT LIKE $', count: 2},
    IS: {sql: '$ IS $', count: 2},
    IS_NULL: {sql: '$ IS NULL', count: 1},
    IS_NOT_NULL: {sql: '$ IS NOT NULL', count: 1},
    NULL_SAFE: {sql: '$ <=> $', count: 2},
    BINARY: {sql: '$ BINARY $', count: 2},
    XOR: {sql: '$ XOR $', count: 2},
    NOT: {sql: '$ NOT $', count: 2},
    IS_NOT: {sql: '$ IS NOT $', count: 2},


    PLUS: {sql: '$ + $', count: 2},
    MINUS: {sql: '$ - $', count: 2},
    DIVISION: {sql: '$ / $', count: 2},
    MULTIPLY: {sql: '$ * $', count: 2},
    DIV: {sql: '$ DIV $', count: 2},
    MOD: {sql: '$ MOD $', count: 2},
    MINUS_SIGN: {sql: '-$', count: 1},

    REGEXP: {sql: '$ REGEXP $', count: 2},
    NOT_REGEXP: {sql: '$ NOT REGEXP $', count: 2},

    B_AND: {sql: '$ & $', count: 2},
    B_INV: {sql: '$ ~ $', count: 2},
    B_OR: {sql: '$ | $', count: 2},
    B_XOR: {sql: '$ ^ $', count: 2},

    ASC: {sql: '$ ASC', count: 1},
    DESC: {sql: '$ DESC', count: 1},

    DEFAULT: {sql: 'DEFAULT', count: 0},

    LEFT_JOIN: {sql: '$ LEFT JOIN $ ON ($)', count: 3},
    RIGHT_JOIN: {sql: '$ RIGHT JOIN $ ON ($)', count: 3},
    INNER_JOIN: {sql: '$ INNER JOIN $ ON ($)', count: 3},
    OUTER_JOIN: {sql: '$ OUTER JOIN $ ON ($)', count: 3},

    SELECT: {sql: '__CUSTOM__', count: 0},
    FROM: {sql: 'FROM $', count: 1},
    WHERE: {sql: 'WHERE $', count: 1},
    GROUP_BY: {sql: 'GROUP BY $', count: 1},
    HAVING: {sql: 'HAVING $', count: 1},
    ORDER_BY: {sql: 'ORDER BY $', count: 1},
    LIMIT: {sql: 'LIMIT $', count: 1},
    LIMIT_OFFSET: {sql: 'LIMIT $, $', count: 2},

    UPDATE: {sql: 'UPDATE $', count: 1},
    SET: {sql: 'SET $', count: 1},
    INSERT_INTO: {sql: 'INSERT INTO $', count: 1},
    VALUES: {sql: 'VALUES $', count: 1},
    ON_DUPLICATE_KEY: {sql: 'ON DUPLICATE KEY UPDATE $', count: 1},
    REPLACE: {sql: 'REPLACE $', count: 1},
    PARTITION: {sql: 'PARTITION $', count: 1},

    FOR_UPDATE: {sql: 'FOR UPDATE', count: 0},
    LOCK_IN_SHARE_MODE: {sql: 'LOCK IN SHARE MODE', count: 0},
};

type Raw = number | string | Date;
type RawOrExpression = Raw | Expression;

export class Expression {
    constructor(private type:{sql:string; count:number}, private val1?:any, private val2?:any, private val3?:any) {
    }

    assign(expr:RawOrExpression) {
        return new Expression(ExpressionTypes.ASSIGN, this, expr);
    }

    or(expr:RawOrExpression) {
        return new Expression(ExpressionTypes.OR, this, expr);
    }

    and(expr:RawOrExpression) {
        return new Expression(ExpressionTypes.AND, this, expr);
    }

    equal(value:RawOrExpression) {
        return new Expression(ExpressionTypes.EQUAL, this, value);
    }

    notEqual(value:RawOrExpression) {
        return new Expression(ExpressionTypes.NOT_EQUAL, this, value);

    }

    is(value:RawOrExpression) {
        return new Expression(ExpressionTypes.IS, this, value);
    }

    isNot(value:RawOrExpression) {
        return new Expression(ExpressionTypes.IS_NOT, this, value);
    }

    not(value:RawOrExpression) {
        return new Expression(ExpressionTypes.NOT, this, value);
    }

    xor(value:RawOrExpression) {
        return new Expression(ExpressionTypes.XOR, this, value);
    }

    isNull() {
        return new Expression(ExpressionTypes.IS_NULL, this);
    }

    isNotNull() {
        return new Expression(ExpressionTypes.IS_NOT_NULL, this);
    }

    greatThan(value:RawOrExpression) {
        return new Expression(ExpressionTypes.GT, this, value);
    }

    greatOrEqualThan(value:RawOrExpression) {
        return new Expression(ExpressionTypes.GTE, this, value);
    }

    lessThan(value:RawOrExpression) {
        return new Expression(ExpressionTypes.LT, this, value);
    }

    lessOrEqualThan(value:RawOrExpression) {
        return new Expression(ExpressionTypes.LTE, this, value);
    }

    in(values:(RawOrExpression)[]) {
        return new Expression(ExpressionTypes.IN, this, values);
    }

    between(value1:RawOrExpression, value2:RawOrExpression) {
        return new Expression(ExpressionTypes.BETWEEN, this, value1, value2);
    }

    notBetween(value1:RawOrExpression, value2:RawOrExpression) {
        return new Expression(ExpressionTypes.NOT_BETWEEN, this, value1, value2);
    }

    like(value1:RawOrExpression) {
        return new Expression(ExpressionTypes.LIKE, this, value1);
    }

    notLike(value1:RawOrExpression) {
        return new Expression(ExpressionTypes.NOT_LIKE, this, value1);
    }

    as(name:string) {
        return new Expression(ExpressionTypes.EQUAL, this, new Value(escapeValue(name)));
    }

    plus(value:RawOrExpression) {
        return new Expression(ExpressionTypes.PLUS, this, value);
    }

    minus(value:RawOrExpression) {
        return new Expression(ExpressionTypes.MINUS, this, value);
    }

    minusSign(value:RawOrExpression) {
        return new Expression(ExpressionTypes.MINUS_SIGN, this);
    }

    multiply(value:RawOrExpression) {
        return new Expression(ExpressionTypes.MULTIPLY, this, value);
    }

    division(value:RawOrExpression) {
        return new Expression(ExpressionTypes.DIVISION, this, value);
    }

    div(value:RawOrExpression) {
        return new Expression(ExpressionTypes.DIV, this, value);
    }

    mod(value:RawOrExpression) {
        return new Expression(ExpressionTypes.MOD, this, value);
    }

    binary(value:RawOrExpression) {
        return new Expression(ExpressionTypes.BINARY, this, value);
    }

    isNullSafe(value:RawOrExpression) {
        return new Expression(ExpressionTypes.NULL_SAFE, this, value);
    }

    regexp(value:RawOrExpression) {
        return new Expression(ExpressionTypes.REGEXP, this, value);
    }

    notRegexp(value:RawOrExpression) {
        return new Expression(ExpressionTypes.NOT_REGEXP, this, value);
    }

    bitAnd(value:RawOrExpression) {
        return new Expression(ExpressionTypes.B_AND, this, value);
    }

    bitInv(value:RawOrExpression) {
        return new Expression(ExpressionTypes.B_INV, this, value);
    }

    bitOr(value:RawOrExpression) {
        return new Expression(ExpressionTypes.B_OR, this, value);
    }

    bitXor(value:RawOrExpression) {
        return new Expression(ExpressionTypes.B_XOR, this, value);
    }

    asc() {
        return new Expression(ExpressionTypes.ASC, this);
    }

    desc() {
        return new Expression(ExpressionTypes.DESC, this);
    }

    select(attributes:RawOrExpression[] | Expression, directives?:RawOrExpression[] | RawOrExpression) {
        return new Expression(ExpressionTypes.SELECT, attributes, directives);
    }

    from(value:Expression) {
        return new Expression(ExpressionTypes.FROM, value);
    }

    where(value:Expression) {
        return new Expression(ExpressionTypes.WHERE, value);
    }

    groupBy(value:Expression) {
        return new Expression(ExpressionTypes.GROUP_BY, value);
    }

    having(value:Expression) {
        return new Expression(ExpressionTypes.HAVING, value);
    }

    orderBy(value:Expression) {
        return new Expression(ExpressionTypes.ORDER_BY, value);
    }

    limit(value:RawOrExpression) {
        return new Expression(ExpressionTypes.LIMIT, value);
    }

    limitWithOffset(offset:RawOrExpression, value:RawOrExpression) {
        return new Expression(ExpressionTypes.LIMIT_OFFSET, offset, value);
    }

    forUpdate() {
        return new Expression(ExpressionTypes.FOR_UPDATE);
    }

    shareLock() {
        return new Expression(ExpressionTypes.LOCK_IN_SHARE_MODE);
    }

    update(value:RawOrExpression, flags?:RawOrExpression[] | RawOrExpression) {
        return new Expression(ExpressionTypes.UPDATE, value, flags);
    }

    set(value:RawOrExpression[] | RawOrExpression) {
        return new Expression(ExpressionTypes.SET, value);
    }

    insertInto(value:RawOrExpression, flags?:RawOrExpression[] | RawOrExpression) {
        return new Expression(ExpressionTypes.INSERT_INTO, value, flags);
    }

    values(value:RawOrExpression[][] | RawOrExpression[] | RawOrExpression) {
        return new Expression(ExpressionTypes.VALUES, value);
    }

    onDuplicateKey(value:Expression) {
        return new Expression(ExpressionTypes.ON_DUPLICATE_KEY, value);
    }

    replace(value:Expression) {
        return new Expression(ExpressionTypes.REPLACE, value);
    }

    partition(value:RawOrExpression[] | RawOrExpression) {
        return new Expression(ExpressionTypes.PARTITION, value);
    }

    default() {
        return new Expression(ExpressionTypes.DEFAULT);
    }

    toSQL(params:any[]):string {
        let sql = this.type.sql;
        let paramsCount = this.type.count;
        if (this instanceof Value) {
            return (this as any as Value).value;
        }
        if (this instanceof Fun) {
            const fun = this as any as Fun;
            const args = Array(fun.args.length);
            for (let i = 0; i < args.length; i++) {
                args[i] = toSQL(fun.args[i], params);
            }
            return `${fun.name}(${args.join(', ')})`;
        }
        // override `empty AND expr` to just `expr`
        if (this.type == ExpressionTypes.AND && this.val1 instanceof EmptyExpression) {
            sql = '$';
            paramsCount = 1;
            this.val1 = this.val2;
        }
        if (this.type === ExpressionTypes.SELECT) {
            const args:string[] = [];
            if (this.val2) {
                args.push(toSQL(this.val2, params, ' '));
            }
            args.push(toSQL(this.val1, params) || '*');

            return `SELECT ${args.join(' ')}`;
        }
        for (var i = 0; i < paramsCount; i++) {
            const val = i == 0 ? this.val1 : (i == 1 ? this.val2 : this.val3);
            if (val instanceof Expression) {
                sql = sql.replace('$', val.toSQL(params));
            } else {
                params.push(val);
                sql = sql.replace('$', '?');
            }
        }
        return sql;
    }
}


type SelectOptions = 'STRAIGHT_JOIN' | 'SQL_SMALL_RESULT' | 'SQL_BIG_RESULT' | 'SQL_BUFFER_RESULT' | 'SQL_CACHE' | 'SQL_NO_CACHE' | 'SQL_CALC_FOUND_ROWS' | 'HIGH_PRIORITY' | 'DISTINCT' | 'DISTINCTROW' | 'ALL';
type InsertIntoFlags = 'LOW_PRIORITY' | 'HIGH_PRIORITY' | 'IGNORE';
type UpdateFlags = 'LOW_PRIORITY' | 'IGNORE';

export interface SelectParams {
    table?:Expression;
    where?:Expression;
    having?:Expression;
    group?:Expression[] | Expression;
    order?:Expression[] | Expression;
    limit?:number;
    offset?:number;
    attributes?:Expression[] | Expression;
    selectOptions?:SelectOptions[];
    lock?:'X' | 'S';
}

export function wexpr() {
    return new EmptyExpression();
}

class EmptyExpression extends Expression {
    constructor() {
        super(ExpressionTypes.EMPTY);
    }
}


export class Value extends Expression {
    constructor(public value:string) {
        super(ExpressionTypes.EMPTY);
    }

    setValue(value:string) {
        this.value = value;
    }
}


export class Table extends Value {
    constructor(public name?:string) {
        super(escapeValue(name));
    }

    leftJoin(table:Expression, on:Expression) {
        return new Expression(ExpressionTypes.LEFT_JOIN, this, table, on);
    }

    innerJoin(table:Expression, on:Expression) {
        return new Expression(ExpressionTypes.INNER_JOIN, this, table, on);
    }

    rightJoin(table:Expression, on:Expression) {
        return new Expression(ExpressionTypes.RIGHT_JOIN, this, table, on);
    }

    outerJoin(table:Expression, on:Expression) {
        return new Expression(ExpressionTypes.OUTER_JOIN, this, table, on);
    }

    field(name:string) {
        return new Attribute(this, name);
    }

    allFields() {
        return new Attribute(this, '*');
    }

    setName(name:string) {
        this.name = name;
        this.setValue(escapeValue(name));
    }
}

export class Fun extends Expression {
    constructor(public name:string, public args:RawOrExpression[]) {
        super(ExpressionTypes.EMPTY);
    }

}

export class Attribute extends Value {
    constructor(public table:Table, public name:string) {
        super(table ? `${table.toSQL(null)}.${escapeValue(name)}` : escapeValue(name));
    }
}


function escapeValue(name:string | Expression):string {
    if (name instanceof Expression) {
        return name.toSQL(null);
    }
    return `${name}`;
}

function toSQL(val:any, values:QueryValues, arraySeparator = ', ') {
    if (val instanceof Expression) {
        return val.toSQL(values);
    }
    if (val instanceof Array) {
        const x:string[] = Array(val.length);
        for (let i = 0; i < val.length; i++) {
            x[i] = toSQL(val[i], values);
        }
        return x.join(arraySeparator);
    }
    values.push(val);
    return '?';
}


export function selectQueryGenerator(params:SelectParams, values:QueryValues) {
    let sq:Expression = new EmptyExpression();
    const sqlParts:Expression[] = [];
    sqlParts.push(sq.select(params.attributes, params.selectOptions));
    if (params.table) {
        sqlParts.push(sq.from(params.table));
    }
    if (params.where) {
        sqlParts.push(sq.where(params.where));
    }
    if (params.group) {
        sqlParts.push(sq.groupBy(params.group as Expression));
    }
    if (params.having) {
        sqlParts.push(sq.groupBy(params.having as Expression));
    }
    if (params.order) {
        sqlParts.push(sq.orderBy(params.order as Expression));
    }
    if (params.limit) {
        sqlParts.push(sq.limitWithOffset(params.offset || 0, params.limit));
    }
    if (params.lock) {
        sqlParts.push(params.lock == 'X' ? sq.forUpdate() : sq.shareLock());
    }
    let sql:string[] = [];
    for (let i = 0; i < sqlParts.length; i++) {
        const part = sqlParts[i];
        sql.push(toSQL(part, values));
    }
    return sql.join(' ');
}


export interface UpdateParams {
    flags?:UpdateFlags[] | UpdateFlags;
    table:RawOrExpression;
    partition?: RawOrExpression[] | RawOrExpression;
    set?:Expression[] | Expression;
    value?:{};
    where?:Expression;
    order?:Expression;
    limit?:number;
}
export function updateSql(params:UpdateParams, values:QueryValues) {
    const parts:Expression[] = [];
    const dump = new EmptyExpression();
    parts.push(dump.update(params.table, params.flags));
    if (params.partition) {
        parts.push(dump.partition(params.partition));
    }
    if (params.value) {
        const setArr:Expression[] = [];
        for (const key in params.value) {
            const value = params.value[key];
            if (value !== void 0) {
                setArr.push(new Value(key).assign(value));
            }
        }
        dump.set(setArr);
    } else {
        dump.set(params.set);
    }
    if (params.where) {
        parts.push(dump.where(params.where));
    }
    if (params.order) {
        parts.push(dump.orderBy(params.order));
    }
    if (params.limit) {
        parts.push(dump.limit(params.limit));
    }
    let sql:string[] = [];
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        sql.push(toSQL(part, values));
    }
    return sql.join(' ');
}


interface InsertParams {
    flags?: InsertIntoFlags;
    table: RawOrExpression;
    partition?: RawOrExpression[] | RawOrExpression;
    cols?: Expression[];
    values?: RawOrExpression[][];
    objValues: {}[];
}

export function insertSql(params:InsertParams, values:QueryValues) {
    const parts:(RawOrExpression | RawOrExpression[] | RawOrExpression[][])[] = [];
    const dump = new EmptyExpression();
    parts.push(dump.insertInto(params.table, params.flags));

    if (params.partition) {
        parts.push(dump.partition(params.partition));
    }
    if (params.cols) {
        parts.push(dump.set(params.cols));
    }
    if (params.values) {
        parts.push(dump.values(params.values));
    }
    if (params.objValues && params.objValues.length > 0) {
        const keys = Object.keys(params.objValues[0]);
        const attrs:string[] = Array(keys.length);
        const values: Expression[][] = [];
        for (let i = 0; i < keys.length; i++) {
            attrs[i] = escapeValue(keys[i]);
        }
        for (let i = 0; i < params.objValues.length; i++) {
            const item = params.objValues[i];
            const row = Array(keys.length);
            for (let j = 0; j < keys.length; j++) {
                row[j] = item[keys[j]];
            }
            values.push(row);
        }
        parts.push(dump.set(attrs));
        parts.push(dump.values(values));
    }
    let sql:string[] = [];
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        sql.push(toSQL(part, values));
    }
    return sql.join(' ');
}

