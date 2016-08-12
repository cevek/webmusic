"use strict";
import {DB} from "./db";
import {Attribute, SelectParams, insertSql, wexpr, selectQueryGenerator, QueryValues, Table} from "./query";
import {Transaction} from "./Transaction";
import {inject} from "./injector";

interface Include {
    model:typeof DAO;
    params?:Params;
}

interface Params extends SelectParams {
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
    model:typeof DAO;
    destinationModel:typeof DAO;
    property:string;
    searchByAttr:Attribute;
    relSearchByAttr:Attribute;
}

export class DAO<T extends BaseType> {
    protected table:Table;
    protected db = inject(DB);

    id:Attribute;

    protected relations = new Map<typeof DAO, Relation>();
    protected fields = new Map<string, Attribute>();

    async create(item:T, trx?:Transaction) {
        return await this.createBulk([item], trx);
    }

    async createBulk(items:T[], trx?:Transaction) {
        const values:QueryValues = [];
        return await this.db.query(insertSql(this.table, items, values), [values], trx);
    }

    async findById(id:number, params:Params = {}) {
        params.table = this.table;
        if (!params.where) {
            params.where = wexpr();
        }
        params.where.and(this.id.equal(id));
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
            await this.processRelation(include.model, include.params, result);
        }
    }

    protected async processRelation(modelx:typeof DAO, params:Params = {}, result:BaseType[], returnSubResult = false) {
        const relation = this.relations.get(modelx);
        const model = relation.model;
        const modelDAO = inject(model);
        const hasDestination = !!relation.destinationModel;
        const destRelation = hasDestination ? modelDAO.relations.get(relation.destinationModel) : null;
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

        const subResult = await inject(model).findAll(localParams);

        let destResult:BaseType[];
        let destKey:string;
        if (hasDestination) {
            if (destRelation.type == RelationType.BELONGS_TO) {
                destKey = destRelation.relSearchByAttr.name;
                destResult = await modelDAO.processRelation(relation.destinationModel, params, subResult, true);
            }
            else {
                throw new Error(`Has not ${destRelation.model.constructor.name} belongsTo relation on ${model.constructor.name}`);
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

    protected addField(fieldName:string) {
        const field = new Attribute(this.table, fieldName);
        this.fields.set(fieldName, field);
        return field;
    }

    protected setTable(table:string) {
        this.table = new Table(table);
        this.id = new Attribute(this.table, 'id');
        return this.table;
    }

    protected addHasOneRelation(fieldName:string, cls:typeof DAO) {
        return this.addRelation(fieldName, cls, null, RelationType.HAS_ONE);
    }

    protected addHasOneThroughRelation(fieldName:string, cls:typeof DAO, through:typeof DAO) {
        return this.addRelation(fieldName, cls, through, RelationType.HAS_ONE_THROUGH);
    }

    protected addHasManyRelation(fieldName:string, cls:typeof DAO) {
        return this.addRelation(fieldName, cls, null, RelationType.HAS_MANY);
    }

    protected addHasManyThroughRelation(fieldName:string, cls:typeof DAO, through:typeof DAO) {
        return this.addRelation(fieldName, cls, through, RelationType.HAS_MANY_THROUGH);
    }

    protected addBelongsToRelation(fieldName:string, cls:typeof DAO) {
        return this.addRelation(fieldName, cls, null, RelationType.BELONGS_TO);
    }

    private normalizeField(name:string) {
        return name.toLowerCase().replace(/dao$/, '');
    }

    private addRelation(property:string, cls:typeof DAO, through:typeof DAO, type:RelationType):any {
        //todo: table names
        const relClass = through ? through : cls;
        const searchByAttr = new Attribute(null, this.normalizeField(this.constructor.name) + 'Id');
        const relSearchByAttr = new Attribute(null, this.normalizeField(relClass.name) + 'Id');
        const isBelongs = type == RelationType.BELONGS_TO;

        const relation = {
            type,
            model: relClass,
            destinationModel: through ? cls : null,
            property,
            searchByAttr: isBelongs ? new Attribute(null, 'id') : searchByAttr,
            relSearchByAttr: isBelongs ? relSearchByAttr : new Attribute(null, 'id')
        };
        this.relations.set(cls, relation);
        return relation;
    }
}


