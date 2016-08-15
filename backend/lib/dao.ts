"use strict";
import {DB} from "./db";
import {
    Attribute, SelectParams, insertSql, wexpr, selectQueryGenerator, QueryValues, Table, updateSql
} from "./query";
import {Transaction} from "./Transaction";
import {inject} from "./injector";
import {ResultSetHeader} from "./Connection";

type DAOX = DAO<BaseType>;
type DAOC = typeof DAO;

interface Include {
    relation:Relation;
    params?:Params;
}

interface Params extends SelectParams {
    include?:Include[];
    trx?:Transaction;
}

interface BaseType {
    // id:number;
}


export class DAO<T extends BaseType> {
    static name:string;
    static id:Attribute;
    protected db = inject(DB);
    static table:Table;

    id:Attribute;

    static rel:any;

    async create(item:T, trx?:Transaction) {
        return await this.createBulk([item], trx);
    }

    async update(item:T, id: number, trx?:Transaction) {
        const values:QueryValues = [];
        const ctor = this.constructor as DAOC;
        const result = await this.db.query(updateSql(ctor.table, item, ctor.id.equal(id), values), values, trx) as ResultSetHeader;
        return result.affectedRows;
    }

    async createBulk(items:T[], trx?:Transaction) {
        const values:QueryValues = [];
        const ctor = this.constructor as DAOC;
        const result = await this.db.query(insertSql(ctor.table, items, values), [values], trx) as ResultSetHeader;
        return result.insertId;
    }

    async findById(id:number, params:Params = {}) {
        params.table = (this.constructor as DAOC).table;
        if (!params.where) {
            params.where = wexpr();
        }
        params.where.and(this.id.equal(id));
        return this.findOne(params);
    }

    async findAll(params:Params = {}) {
        const values:string[] = [];
        params.table = (this.constructor as DAOC).table;
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
            await this.processRelation(include.relation, include.params, result, null, include.relation.property);
        }
    }

    protected async processRelation(relation:Relation, params:Params = {}, result:BaseType[], parentResult: BaseType[], property: string, parentSubItems?: BaseType[], parentAggregateFieldName?: string, parentFK?: string) {
        const isBelongs = relation.type == RelationType.BELONGS_TO;
        let modelDAO:DAOX;

        let aggregateFieldName:string;
        let from: DDD;
        let model: DDD;
        from = relation.fromx;
        if (relation.through) {
            model = relation.through.fromx;
        }
        else {
            model = relation.model;
        }
        modelDAO = inject(model);
        aggregateFieldName = isBelongs ? relation.foreignKey.name : from.id.name;

        // todo: hasMany from parameters
        let isHasMany = relation.type == RelationType.HAS_MANY || relation.type == RelationType.HAS_MANY_THROUGH || parentSubItems;

        const ids = Array(result.length);

        const foreignKeyName = isBelongs ? model.id.name : relation.foreignKey.name;
        // console.log('aggregateFieldName', aggregateFieldName);
        // console.log('foreignKeyName', foreignKeyName);


        for (let i = 0; i < result.length; i++) {
            ids[i] = result[i][aggregateFieldName];
        }

        const cond = isBelongs ? model.id.in(ids) : relation.foreignKey.in(ids);
        let localParams = params;
        if (relation.through) {
            localParams = {where: cond};
        } else {
            if (!localParams.where) {
                localParams.where = wexpr();
            }
            localParams.where = localParams.where.and(cond);
        }

        const subResult = await modelDAO.findAll(localParams);

        if (relation.through) {
            const modelDAO = inject(relation.through.model);
            await modelDAO.processRelation(relation.through, params, subResult, result, property, subResult, aggregateFieldName, foreignKeyName);
            return;
        }

        let map: {};
        if (parentSubItems) {
            map = {};
            for (let i = 0; i < parentSubItems.length; i++) {
                let item = parentSubItems[i];
                const key = item[aggregateFieldName];
                let oldVal = map[key];
                if (!oldVal) {
                    map[key] = oldVal = [];
                }
                oldVal.push(item[parentFK]);
            }
        }

        const subIdsMap = {};
        for (let i = 0; i < subResult.length; i++) {
            let item = subResult[i];
            let keys = [item[foreignKeyName]];
            if (map) {
                keys = map[item[foreignKeyName]];
            }
            //todo: need to optimize
            for (let j = 0; j < keys.length; j++) {
                const key = keys[j];

                if (isHasMany) {
                    let val = subIdsMap[key];
                    if (!val) {
                        val = subIdsMap[key] = [];
                    }
                    val.push(item);
                }
                else {
                    subIdsMap[key] = item;
                }
            }
        }

        if (parentResult) {
            result = parentResult;
        }
        if (!parentAggregateFieldName) {
            parentAggregateFieldName = aggregateFieldName;
        }
        for (let i = 0; i < result.length; i++) {
            const item = result[i];
            const key = item[parentAggregateFieldName];
            let prop = item[property];
            const value = subIdsMap[key];
            if (prop) {
                prop = prop.concat(value);
            } else {
                prop = value;
            }
            item[property] = prop;
        }
        return null;
    }

    static field(name:string) {
        return new Attribute(this.table, name);
    }

    static hasMany(cls:DDD, foreignKey:Attribute, property:string) {
        return new Relation(RelationType.HAS_MANY, this, cls, null, foreignKey, property)
    }

    static hasManyThrough(through:Relation, foreignKey:Attribute, property:string) {
        return new Relation(RelationType.HAS_MANY_THROUGH, this, null, through, foreignKey, property);
    }

    static hasOne(cls:DDD, foreignKey:Attribute, property:string) {
        return new Relation(RelationType.HAS_ONE, this, cls, null, foreignKey, property)
    }

    static hasOneThrough(through:Relation, foreignKey:Attribute, property:string) {
        return new Relation(RelationType.HAS_ONE_THROUGH, this, null, through, foreignKey, property)
    }

    static belongsTo(cls:DDD, foreignKey:Attribute, property:string) {
        return new Relation(RelationType.BELONGS_TO, this, cls, null, foreignKey, property)
    }
}


const enum RelationType {
    HAS_ONE, HAS_ONE_THROUGH, HAS_MANY, HAS_MANY_THROUGH, BELONGS_TO
}

interface DDD {
    new ():DAOX;
    table:Table;
    id:Attribute;
}

class Relation {
    type:RelationType;
    cls:DDD;
    model:DDD;
    through:Relation;
    fromx:DDD;
    property:string;

    foreignKey:Attribute;

    constructor(type:RelationType, from:DDD, cls:DDD, through:Relation, foreignKey:Attribute, property:string) {
        this.type = type;
        this.fromx = from;
        this.cls = cls;
        this.model = cls;
        this.through = through;
        this.foreignKey = foreignKey;
        this.property = property;
    }
}
