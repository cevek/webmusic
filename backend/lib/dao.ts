"use strict";
import {DB, Transaction} from "./db";
interface Include {
    model:InstanceClass<BaseType>;
    params?:Params;
}

interface Join {
    type?:'INNER' | 'LEFT' | 'OUTER';
    model:InstanceClass<BaseType>;
    on:Expression<Object>;
}

type OrderExpression = {col:Attribute<Object>, desc?:boolean};
type SelectOptions = 'STRAIGHT_JOIN' | 'SQL_SMALL_RESULT' | 'SQL_BIG_RESULT' | 'SQL_BUFFER_RESULT' | 'SQL_CACHE' | 'SQL_NO_CACHE' | 'SQL_CALC_FOUND_ROWS' | 'HIGH_PRIORITY' | 'DISTINCT' | 'DISTINCTROW' | 'ALL';
interface Params {
    where?:Expression<Object>;
    having?:Expression<Object>;
    group?:OrderExpression[];
    order?:OrderExpression[];
    limit?:number;
    offset?:number;
    attributes?:Expression<Object>[];
    join?:Join[];
    include?:Include[];
    trx?:Transaction;
    selectOptions?:SelectOptions[];
    lock?:'X' | 'S';
}

type ID = number;

interface BaseType {
    id:ID;
}

const ExpressionTypes = {
    EMPTY: {sql: '', count: 0},
    VALUE: {sql: '$', count: 1},
    AS: {sql: '$ AS $', count: 2},

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
};

type B<T> = Expression<T>;

export class Expression<T> {
    constructor(private type:{sql:string; count:number}, private val1?:any, private val2?:any, private val3?:any) {
    }

    or(expr:B<T>) {
        return new Expression(ExpressionTypes.OR, this, expr);
    }

    and(expr:B<T>) {
        return new Expression(ExpressionTypes.AND, this, expr);
    }

    equal(value:B<T>) {
        return new Expression(ExpressionTypes.EQUAL, this, value);
    }

    notEqual(value:B<T>) {
        return new Expression(ExpressionTypes.NOT_EQUAL, this, value);

    }

    is(value:B<T>) {
        return new Expression(ExpressionTypes.IS, this, value);
    }

    isNot(value:B<T>) {
        return new Expression(ExpressionTypes.IS_NOT, this, value);
    }

    not(value:B<T>) {
        return new Expression(ExpressionTypes.NOT, this, value);
    }

    xor(value:B<T>) {
        return new Expression(ExpressionTypes.XOR, this, value);
    }

    isNull() {
        return new Expression(ExpressionTypes.IS_NULL, this);
    }

    isNotNull() {
        return new Expression(ExpressionTypes.IS_NOT_NULL, this);
    }

    greatThan(value:B<T>) {
        return new Expression(ExpressionTypes.GT, this, value);
    }

    greatOrEqualThan(value:B<T>) {
        return new Expression(ExpressionTypes.GTE, this, value);
    }

    lessThan(value:B<T>) {
        return new Expression(ExpressionTypes.LT, this, value);
    }

    lessOrEqualThan(value:B<T>) {
        return new Expression(ExpressionTypes.LTE, this, value);
    }

    in(values:(B<T>)[]) {
        return new Expression(ExpressionTypes.IN, this, values);
    }

    between(value1:B<T>, value2:B<T>) {
        return new Expression(ExpressionTypes.BETWEEN, this, value1, value2);
    }

    notBetween(value1:B<T>, value2:B<T>) {
        return new Expression(ExpressionTypes.NOT_BETWEEN, this, value1, value2);
    }

    like(value1:B<T>) {
        return new Expression(ExpressionTypes.LIKE, this, value1);
    }

    notLike(value1:B<T>) {
        return new Expression(ExpressionTypes.NOT_LIKE, this, value1);
    }

    as(name:string) {
        return new Expression(ExpressionTypes.EQUAL, this, new Attribute(name));
    }

    plus(value:B<T>) {
        return new Expression(ExpressionTypes.PLUS, this, value);
    }

    minus(value:B<T>) {
        return new Expression(ExpressionTypes.MINUS, this, value);
    }

    minusSign(value:B<T>) {
        return new Expression(ExpressionTypes.MINUS_SIGN, this);
    }

    multiply(value:B<T>) {
        return new Expression(ExpressionTypes.MULTIPLY, this, value);
    }

    division(value:B<T>) {
        return new Expression(ExpressionTypes.DIVISION, this, value);
    }

    div(value:B<T>) {
        return new Expression(ExpressionTypes.DIV, this, value);
    }

    mod(value:B<T>) {
        return new Expression(ExpressionTypes.MOD, this, value);
    }

    binary(value:B<T>) {
        return new Expression(ExpressionTypes.BINARY, this, value);
    }

    isNullSafe(value:B<T>) {
        return new Expression(ExpressionTypes.NULL_SAFE, this, value);
    }

    regexp(value:B<T>) {
        return new Expression(ExpressionTypes.REGEXP, this, value);
    }

    notRegexp(value:B<T>) {
        return new Expression(ExpressionTypes.NOT_REGEXP, this, value);
    }

    bitAnd(value:B<T>) {
        return new Expression(ExpressionTypes.B_AND, this, value);
    }

    bitInv(value:B<T>) {
        return new Expression(ExpressionTypes.B_INV, this, value);
    }

    bitOr(value:B<T>) {
        return new Expression(ExpressionTypes.B_OR, this, value);
    }

    bitXor(value:B<T>) {
        return new Expression(ExpressionTypes.B_XOR, this, value);
    }

    toSQL(params:any[] = []):string {
        let sql = this.type.sql;
        let paramsCount = this.type.count;
        if (this instanceof Value) {
            return (this as any as Value<T>).value;
        }
        if (this instanceof Fun) {
            const fun = this as any as Fun<T>;
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


export function wexpr() {
    return new EmptyExpression();
}

class EmptyExpression extends Expression<Object> {
    constructor() {
        super(ExpressionTypes.EMPTY);
    }
}


export class Value<T> extends Expression<T> {
    constructor(public value:string) {
        super(ExpressionTypes.EMPTY);
    }
}

export class Fun<T> extends Expression<T> {
    constructor(public name:string, public args:Expression<Object>[]) {
        super(ExpressionTypes.EMPTY);
    }

}

export class Attribute<T> extends Value<T> {
    constructor(public name:string) {
        super(name);
    }
}


const enum RelationType {
    HAS_ONE, HAS_ONE_THROUGH, HAS_MANY, HAS_MANY_THROUGH, BELONGS_TO
}
interface Relation {
    type:RelationType;
    model:InstanceClass<BaseType>;
    destinationModel:InstanceClass<BaseType>;
    property:string;
    searchByAttr:Attribute<Object>;
    relSearchByAttr:Attribute<Object>;
}
interface InstanceClass<T extends BaseType> {
    new ():T;
    _dao?:DAO<T>;
    _relations?:{[id:string]:Relation};
}

export abstract class DAO<T extends BaseType> {
    protected table:string;
    protected Class:InstanceClass<T>;

    constructor(protected db:DB, table:string, Class:InstanceClass<T>) {
        this.table = table;
        this.Class = Class;
        this.Class._dao = this;
    }

    async create(item:T, trx?:Transaction) {
        return await this.db.query(this.db.insertSql(this.table, [item]), null, trx);
    }

    async createBulk(items:T[], trx?:Transaction) {
        return await this.db.query(this.db.insertSql(this.table, items), null, trx);
    }

    async findById(id:ID, params?:Params) {
        const result = await this.db.queryOne<T>(`SELECT * FROM \`${this.table}\` WHERE id=:id`, {id}, params && params.trx);
        if (params.include) {
            await this.includeRelations(params.include, [result]);
        }
        return result;
    }

    async findByIds(ids:ID[], params?:Params) {
        if (!ids.length) {
            return [];
        }
        let result = await this.db.queryAll<T>(`SELECT * FROM \`${this.table}\` WHERE id IN (?)`, [ids], params && params.trx);
        if (params.include) {
            await this.includeRelations(params.include, result);
        }
        return result;
    }

    async findAll(params?:Params) {
        const pp:any[] = [];
        const sql = this.selectQueryGenerator(params, pp);
        const result = await this.db.queryAll<T>(sql, pp, params && params.trx);
        if (params.include) {
            await this.includeRelations(params.include, result);
        }
        return result;
    }

    async findOne(params?:Params) {
        const result = await this.db.queryOne<T>(`SELECT * FROM \`${this.table}\` ${this.db.whereSql(params && params.where)}`, null, params && params.trx);
        if (params.include) {
            await this.includeRelations(params.include, [result]);
        }
        return result;
    }

    private async includeRelations(includes:Include[], result:T[]) {
        for (var i = 0; i < includes.length; i++) {
            const include = includes[i];
            await this.getRelations(include.model.name, include, result);
        }
    }

    private selectQueryGenerator(params:Params, pp:any[]) {
        let selectOptions = '', attrs = ' *', join = '', where = '', having = '', group = '', order = '', limit = '', lock = '';
        if (params.selectOptions) {
            selectOptions = ' ' + params.selectOptions.join(' ');
        }
        if (params.attributes && params.attributes.length) {
            let attrsArr = Array(params.attributes.length);
            for (var i = 0; i < params.attributes.length; i++) {
                attrsArr[i] = params.attributes[i].toSQL(pp);
            }
            attrs = ' ' + attrsArr.join(', ');
        }
        const fromTable = `\`${this.table}\``;
        if (params.join && params.join.length) {
            let joinArr = Array(params.join.length);
            for (var i = 0; i < params.join.length; i++) {
                const joinItem = params.join[i];
                joinArr[i] = `${joinItem.type ? ` ${joinItem.type}` : ''} JOIN ${joinItem.model._dao.table} ON ${joinItem.on.toSQL(pp)}`;
            }
            join = joinArr.join('');
        }
        if (params.where) {
            where = ` WHERE ${params.where.toSQL(pp)}`;
        }
        if (params.group && params.group.length) {
            let groupArr = Array(params.group.length);
            for (var i = 0; i < params.group.length; i++) {
                const groupItem = params.group[i];
                groupArr[i] = groupItem.col.toSQL(pp) + groupItem.desc ? ' DESC' : '';
            }
            group = ` GROUP BY ${groupArr.join(', ')}`;
        }
        if (params.having) {
            having = ` HAVING ${params.having.toSQL(pp)}`;
        }
        if (params.order && params.order.length) {
            let orderArr = Array(params.order.length);
            for (var i = 0; i < params.order.length; i++) {
                const orderItem = params.order[i];
                orderArr[i] = orderItem.col.toSQL(pp) + orderItem.desc ? ' DESC' : '';
            }
            order = ` ORDER BY ${orderArr.join(', ')}`;
        }
        if (params.limit) {
            limit = ` LIMIT ?, ?`;
            pp.push(params.offset || 0, params.limit);
        }
        if (params.lock) {
            lock = params.lock == 'X' ? 'FOR UPDATE' : 'LOCK IN SHARE MODE';
        }
        const sql = `SELECT${selectOptions}${attrs} FROM ${fromTable}${join}${where}${group}${having}${order}${limit}${lock}`;
        return sql;
    }

    protected async getRelations(key: string, params:Params = {}, result:BaseType[], returnSubResult = false) {
        const relation = this.Class._relations[key];
        const model = relation.model;
        const hasDestination = !!relation.destinationModel;
        const destRelation = hasDestination ? model._relations[relation.destinationModel.name] : null;
        const isHasMany = relation.type == RelationType.HAS_MANY || relation.type == RelationType.HAS_MANY_THROUGH;
        const ids = Array(result.length);
        const attrName = relation.searchByAttr.value;
        const relationName = relation.relSearchByAttr.value;
        for (let i = 0; i < result.length; i++) {
            ids[i] = result[i][relationName];
        }
        const cond = relation.searchByAttr.in(ids);
        let localParams = params;
        if (hasDestination) {
            localParams = {where: cond};
        } else {
            if (!localParams.where) {
                localParams.where = wexpr();
            }
            localParams.where = localParams.where.and(cond);
        }

        const subResult = await model._dao.findAll(localParams);

        let destResult:BaseType[];
        let destKey:string;
        if (hasDestination) {
            if (destRelation.type == RelationType.BELONGS_TO) {
                destKey = destRelation.relSearchByAttr.name;
                destResult = await model._dao.getRelations(relation.destinationModel.name, params, subResult, true);
            }
            else {
                throw new Error(`Has not ${destRelation.model.name} belongsTo relation on ${model.name}`);
            }
        }

        const subIdsMap = {};
        for (let i = 0; i < subResult.length; i++) {
            let subItem = subResult[i];
            const selfId = subItem[attrName];
            if (hasDestination) {
                subItem = destResult[subItem[destKey]];
            }
            if (isHasMany) {
                let val = subIdsMap[selfId];
                if (!val) {
                    val = subIdsMap[selfId] = [];
                }
                val.push(subItem);
            }
            else {
                subIdsMap[selfId] = subItem;
            }
        }

        if (returnSubResult) {
            return subIdsMap;
        }

        for (let i = 0; i < result.length; i++) {
            const item = result[i];
            const key = item[relationName];
            item[relation.property] = subIdsMap[key];
        }
        return null;
    }
}


function relation(cls:InstanceClass<BaseType>, through:InstanceClass<BaseType>, type:RelationType, isHas:boolean):any {
    return (target:BaseType, property:string, descriptor:TypedPropertyDescriptor<Object>) => {
        const constructor = target.constructor as InstanceClass<BaseType>;
        if (!constructor._relations) {
            constructor._relations = {};
        }
        const relClass = through ? through : cls;
        const searchByAttr = new Attribute(target.constructor.name.toLowerCase() + 'Id');
        const relSearchByAttr = new Attribute(relClass.name.toLowerCase() + 'Id');
        constructor._relations[cls.name] = {
            type,
            model: relClass,
            destinationModel: through ? cls : null,
            property,
            searchByAttr: isHas ? searchByAttr : new Attribute('id'),
            relSearchByAttr: isHas ? new Attribute('id') : relSearchByAttr
        };
        return descriptor;
    };
}

export function HasMany(cls:InstanceClass<BaseType>) {
    return relation(cls, null, RelationType.HAS_MANY, true);
}
export function HasManyThrough(cls:InstanceClass<BaseType>, through:InstanceClass<BaseType>) {
    return relation(cls, through, RelationType.HAS_MANY_THROUGH, true);
}

export function HasOne(cls:InstanceClass<BaseType>) {
    return relation(cls, null, RelationType.HAS_ONE, true);
}
export function HasOneThrough(cls:InstanceClass<BaseType>, through:InstanceClass<BaseType>) {
    return relation(cls, through, RelationType.HAS_ONE_THROUGH, true);
}

export function BelongsTo(cls:InstanceClass<BaseType>) {
    return relation(cls, null, RelationType.BELONGS_TO, false);
}
