export type QueryValues = any[];

export interface Join {
    type?:'INNER' | 'LEFT' | 'OUTER';
    table:Expression;
    on:Expression;
}

export const ExpressionTypes = {
    EMPTY: {sql: '', count: 0},
    VALUE: {sql: '$', count: 1},
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


    LEFT_JOIN: {sql: 'LEFT JOIN $ ON ($)', count: 2},
    RIGHT_JOIN: {sql: 'RIGHT JOIN $ ON ($)', count: 2},
    INNER_JOIN: {sql: 'INNER JOIN $ ON ($)', count: 2},
    OUTER_JOIN: {sql: 'OUTER JOIN $ ON ($)', count: 2},
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
                args[i] = fun.args[i].toSQL(params);
            }
            return `${fun.name}(${args.join(', ')})`;
        }
        // override `empty AND expr` to just `expr`
        if (this.type == ExpressionTypes.AND && this.val1 instanceof EmptyExpression) {
            sql = '$';
            paramsCount = 1;
            this.val1 = this.val2;
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


type OrderExpression = {col:Value, desc?:boolean};
type SelectOptions = 'STRAIGHT_JOIN' | 'SQL_SMALL_RESULT' | 'SQL_BIG_RESULT' | 'SQL_BUFFER_RESULT' | 'SQL_CACHE' | 'SQL_NO_CACHE' | 'SQL_CALC_FOUND_ROWS' | 'HIGH_PRIORITY' | 'DISTINCT' | 'DISTINCTROW' | 'ALL';

export interface SelectParams {
    table?:Table;
    where?:Expression;
    having?:Expression;
    group?:Expression[] | Expression;
    order?:Expression[] | Expression;
    limit?:number;
    offset?:number;
    attributes?:Expression[] | Expression;
    join?:Expression;
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

    leftJoinOn(on:Expression) {
        return new Expression(ExpressionTypes.LEFT_JOIN, this, on);
    }

    innerJoinOn(on:Expression) {
        return new Expression(ExpressionTypes.INNER_JOIN, this, on);
    }

    rightJoinOn(on:Expression) {
        return new Expression(ExpressionTypes.RIGHT_JOIN, this, on);
    }

    outerJoinOn(on:Expression) {
        return new Expression(ExpressionTypes.OUTER_JOIN, this, on);
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
    constructor(public name:string, public args:Expression[]) {
        super(ExpressionTypes.EMPTY);
    }

}

export class Attribute extends Value {
    constructor(public table:Table, public name:string) {
        super(table ? `${table.toSQL(null)}.${escapeValue(name)}` : escapeValue(name));
    }
}

export function insertSql(table:Table, items:any[], values:QueryValues) {
    const keys = Object.keys(items[0]);
    const attrs:string[] = Array(keys.length);
    for (let i = 0; i < keys.length; i++) {
        attrs[i] = escapeValue(keys[i]);
    }
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const row = Array(keys.length);
        for (let j = 0; j < keys.length; j++) {
            row[j] = item[keys[j]];
        }
        values.push(row);
    }

    return `INSERT INTO ${table.toSQL(null)} (${attrs.join(', ')}) VALUES ?`;
}


function escapeValue(name:string | Expression):string {
    if (name instanceof Expression) {
        return name.toSQL(null);
    }
    return `${name}`;
}

function toSQL(val:any, values:QueryValues) {
    if (val instanceof Expression) {
        return val.toSQL(values);
    }
    if (val instanceof Array) {
        const x:string[] = Array(val.length);
        for (let i = 0; i < val.length; i++) {
            x[i] = toSQL(val[i], values);
        }
        return x.join(', ');
    }
    values.push(val);
    return '?';
}


export function selectQueryGenerator(params:SelectParams, values:QueryValues) {
    let selectOptions = '', attrs = ' *', join = '', where = '', having = '', group = '', order = '', limit = '', lock = '';
    if (params.selectOptions) {
        selectOptions = ' ' + params.selectOptions.join(' ');
    }
    if (params.attributes) {
        attrs = ` ${toSQL(params.attributes, values)}`;
    }
    const fromTable = params.table.toSQL(values);
    if (params.join) {
        join = ` ${params.join.toSQL(values)}`;
    }
    if (params.where) {
        where = ` WHERE ${params.where.toSQL(values)}`;
    }
    if (params.group) {
        group = ` GROUP BY ${toSQL(params.group, values)}`;
    }
    if (params.having) {
        having = ` HAVING ${params.having.toSQL(values)}`;
    }
    if (params.order) {
        order = ` ORDER BY ${toSQL(params.order, values)}`;
    }
    if (params.limit) {
        limit = ` LIMIT ?, ?`;
        values.push(params.offset || 0, params.limit);
    }
    if (params.lock) {
        lock = params.lock == 'X' ? 'FOR UPDATE' : 'LOCK IN SHARE MODE';
    }
    const sql = `SELECT${selectOptions}${attrs} FROM ${fromTable}${join}${where}${group}${having}${order}${limit}${lock}`;
    return sql;
}

export function updateSql(table:Table, item:any, condition:Expression, values:QueryValues) {
    const items:string[] = [];
    for (const key in item) {
        const value = item[key];
        if (value !== void 0) {
            items.push(new Value(key).assign(value).toSQL(values));
        }
    }
    let where = '';
    if (condition) {
        where = ` WHERE ${condition.toSQL(values)}`;
    }
    return `UPDATE ${table.toSQL(values)} SET ${items.join(', ')}${where}`;
}
