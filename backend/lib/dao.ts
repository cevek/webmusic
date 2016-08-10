"use strict";
import {DB} from "./db";
import {Attribute, SelectParams, insertSql, wexpr, selectQueryGenerator, QueryValues} from "./query";
import {Transaction} from "./Transaction";
interface Include {
    model:InstanceClass<BaseType>;
    params?:Params;
}

interface Params extends SelectParams{
    include?:Include[];
    trx?:Transaction;
}

interface BaseType {
    id:number;
}

const enum RelationType {
    HAS_ONE, HAS_ONE_THROUGH, HAS_MANY, HAS_MANY_THROUGH, BELONGS_TO
}

interface Relation {
    type:RelationType;
    model:InstanceClass<BaseType>;
    destinationModel:InstanceClass<BaseType>;
    property:string;
    searchByAttr:Attribute;
    relSearchByAttr:Attribute;
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
        return await this.createBulk([item], trx);
    }

    async createBulk(items:T[], trx?:Transaction) {
        const values:QueryValues = [];
        return await this.db.query(insertSql(this.table, items, values), [values], trx);
    }

    async findById(id:number, params: Params = {}) {
        params.table = this.table;
        if (!params.where) {
            params.where = wexpr();
        }
        params.where.and(new Attribute('id').equal(id));
        return this.findOne(params);
    }

    async findAll(params:Params = {}) {
        const values:string[] = [];
        params.table = this.table;
        const sql = selectQueryGenerator(params, values);
        const result = await this.db.queryAll<T>(sql, values, params && params.trx);
        if (params.include) {
            await this.includeRelations(params.include, result);
        }
        return result;
    }

    async findOne(params?:Params) {
        return (await this.findAll(params)).pop();
    }

    private async includeRelations(includes:Include[], result:T[]) {
        for (let i = 0; i < includes.length; i++) {
            const include = includes[i];
            await this.getRelations(include.model.name, include, result);
        }
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
