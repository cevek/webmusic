"use strict";
import {DB, Transaction} from "./db";
interface Include {
    model:InstanceClass<BaseType>;
    params?:Params;
}

interface Params {
    where?:Expression;
    limit?:Object | number;
    attributes?:string[];
    include?:Include[];
    trx?:Transaction;
}

type ID = number;

interface BaseType {
    id:ID;
}

const ExpressionTypes = {
    EMPTY: {sql: '', count: 0},
    VALUE: {sql: '$', count: 1},
    AND: {sql: '$ AND $', count: 2},
    OR: {sql: '($ OR $)', count: 2},
    EQ: {sql: '$ = $', count: 2},
    NEQ: {sql: '$ != $', count: 2},
    IS: {sql: '$ IS $', count: 2},
    NL: {sql: '$ IS NULL', count: 1},
    NNL: {sql: '$ IS NOT NULL', count: 1},
    GT: {sql: '$ > $', count: 2},
    GTE: {sql: '$ >= $', count: 2},
    LT: {sql: '$ < $', count: 2},
    LTE: {sql: '$ <= $', count: 2},
    IN: {sql: '$ IN $', count: 2},
    NIN: {sql: '$ NOT IN $', count: 2},
    BT: {sql: '$ BETWEEN $ AND $', count: 3},
    NBT: {sql: '$ NOT BETWEEN $ AND $', count: 3},
    LK: {sql: '$ LIKE $', count: 2},
    NLK: {sql: '$ NOT LIKE $', count: 2}
};

export class Expression {
    constructor(private type:{sql:string; count:number}, private val1?:any, private val2?:any, private val3?:any) {
    }

    or(expr:Expression) {
        return new Expression(ExpressionTypes.OR, this, expr);
    }

    and(expr:Expression) {
        return new Expression(ExpressionTypes.AND, this, expr);
    }

    toSQL(params:any[] = []) {
        let sql = this.type.sql;
        let paramsCount = this.type.count;
        if (this.val1 instanceof Attribute) {
            return this.val1.name;
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
                sql.replace('$', val.toSQL(params));
            } else {
                params.push(val);
                sql.replace('$', '?');
            }
        }
        return sql;
    }
}

export function expr() {
    return new EmptyExpression();
}

class EmptyExpression extends Expression {
    constructor() {
        super(ExpressionTypes.EMPTY);
    }
}

export class Attribute<T> extends Expression {
    constructor(private name:string) {
        super(ExpressionTypes.EMPTY);
    }

    equal(value:T) {
        return new Expression(ExpressionTypes.EQ, this, value);
    }

    notEqual(value:T) {
        return new Expression(ExpressionTypes.NEQ, this, value);

    }

    is(value:T) {
        return new Expression(ExpressionTypes.IS, this, value);
    }


    isNull() {
        return new Expression(ExpressionTypes.NL, this);
    }

    isNotNull() {
        return new Expression(ExpressionTypes.NNL, this);
    }

    greatThan(value:T) {
        return new Expression(ExpressionTypes.GT, this, value);
    }

    greatOrEqualThan(value:T) {
        return new Expression(ExpressionTypes.GTE, this, value);
    }

    lessThan(value:T) {
        return new Expression(ExpressionTypes.LT, this, value);
    }

    lessOrEqualThan(value:T) {
        return new Expression(ExpressionTypes.LTE, this, value);
    }

    in(values:T[]) {
        return new Expression(ExpressionTypes.IN, this, values);
    }

    between(value1:T, value2:T) {
        return new Expression(ExpressionTypes.BT, this, value1, value2);
    }

    notBetween(value1:T, value2:T) {
        return new Expression(ExpressionTypes.NBT, this, value1, value2);
    }

    like(value1:string) {
        return new Expression(ExpressionTypes.LK, this, value1);
    }

    notLike(value1:string) {
        return new Expression(ExpressionTypes.NLK, this, value1);
    }

    getName() {
        return this.name;
    }
}


const enum RelationType {
    HAS_ONE, HAS_MANY, MANY_TO_MANY, BELONGS_TO, BELONGS_TO_MANY
}
interface Relation {
    type:RelationType;
    model:InstanceClass<BaseType>;
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

    protected _selfAttribute:Attribute<ID>;
    protected get selfAttribute() {
        return this._selfAttribute || (this._selfAttribute = new Attribute(this.Class.name + 'Id'));
    }

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
        const result = await this.db.queryAll<T>(`SELECT * FROM \`${this.table}\` ${this.db.whereSql(params && params.where)}`, null, params && params.trx);
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
            const relation = this.Class._relations[include.model.name];

            if (relation) {
                await this.getRelations(include, relation, result);
            }
        }
    }

    private async getRelations(include:Include, relation:Relation, result:BaseType[]) {
        // console.log('getRelations', include, relation, result);
        const {type, property} = relation;
        const isHasOne = type == RelationType.HAS_ONE;
        const isHasMany = type == RelationType.HAS_MANY;
        const isBelongsTo = type == RelationType.BELONGS_TO;
        const isBelongsToMany = type == RelationType.BELONGS_TO_MANY;
        const isMany = isHasMany || isBelongsToMany;
        const isHas = isHasOne || isHasMany;
        const isBelongs = isBelongsTo || isBelongsToMany;

        const {model, params = {}} = include;
        const ids = Array(result.length);
        const attrName = relation.searchByAttr.getName();
        const relationName = relation.relSearchByAttr.getName();
        for (let i = 0; i < result.length; i++) {
            const item = result[i];
            ids[i] = isHas ? item.id : item[relationName];
        }
        if (!params.where) {
            params.where = expr();
        }
        if (isHas) {
            params.where = params.where.and(relation.searchByAttr.in(ids));
        }
        else if (isBelongs) {
            params.where = params.where.and(relation.relSearchByAttr.in(ids));
        }
        const subResult = await model._dao.findAll(params);

        const subIdsMap = {};
        const searchKey = isBelongs ? 'id' : attrName;
        const searchKey2 = isBelongs ? relationName : 'id';

        for (let i = 0; i < subResult.length; i++) {
            const subItem = subResult[i];
            const selfId = subItem[searchKey];
            if (isMany) {
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

        for (let i = 0; i < result.length; i++) {
            const item = result[i];
            const key = item[searchKey2];
            item[property] = subIdsMap[key];
        }
    }
}


function relation(cls:InstanceClass<BaseType>, type:RelationType, oppositeType:RelationType):any {
    return (target:BaseType, property:string, descriptor:TypedPropertyDescriptor<Object>) => {
        const constructor = target.constructor as InstanceClass<BaseType>;
        if (!constructor._relations) {
            constructor._relations = {};
        }
        const searchByAttr = new Attribute(target.constructor.name.toLowerCase() + 'Id');
        const relSearchByAttr = new Attribute(cls.name.toLowerCase() + 'Id');
        constructor._relations[cls.name] = {type, model: cls, property, searchByAttr, relSearchByAttr};
        return descriptor;
    };
}

export function HasMany(cls:InstanceClass<BaseType>) {
    return relation(cls, RelationType.HAS_MANY, RelationType.BELONGS_TO);
}

export function HasOne(cls:InstanceClass<BaseType>) {
    return relation(cls, RelationType.HAS_ONE, RelationType.BELONGS_TO);
}

export function BelongsTo(cls:InstanceClass<BaseType>) {
    return relation(cls, RelationType.BELONGS_TO, RelationType.HAS_ONE);
}
export function BelongsToMany(cls:InstanceClass<BaseType>) {
    return relation(cls, RelationType.BELONGS_TO_MANY, RelationType.HAS_MANY);
}