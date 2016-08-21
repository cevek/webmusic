"use strict";
import {DB} from "./db";
import {Transaction} from "./Transaction";
import {inject} from "./injector";
import {ResultSetHeader} from "./Connection";
import {QueryValues} from "./sql/Base";
import {SQL} from "./sql/sql";
import {Field, Table} from "./sql/DataSource";
import {Expression} from "./sql/Expression";
import {Identifier} from "./sql/Identifier";
import {UpdateParams} from "./sql/Update";
import {DeleteParams} from "./sql/Delete";
import {InsertParams} from "./sql/Insert";
import {SelectParams} from "./sql/SelectQuery";


type DAOX = DAO<BaseType>;
type DAOC = typeof DAO;

interface Include {
    relation: Relation;
    params?: Params;
}

interface Params {
    include?: Include[];
    trx?: Transaction;
}


interface BaseType {
    // id:number;
}


export class DAO<T extends BaseType> {
    static name: string;
    static id: Field;
    protected db = inject(DB);
    static table: Table;

    // id: Field;

    static rel: any;

    async create(item: T, trx?: Transaction) {
        return await this.createBulk([item], trx);
    }

    async update(item: T, id: number, trx?: Transaction) {
        const ctor = this.constructor as DAOC;
        return this.updateCustom({value: item, where: ctor.id.equal(id)}, trx);
    }

    async updateCustom(params: UpdateParams = {}, trx?: Transaction) {
        const values: QueryValues = [];
        const ctor = this.constructor as DAOC;
        if (!params.table) {
            params.table = ctor.table;
        }
        const sql = SQL.update().fromParams(params).toSQL(values);
        const result = await this.db.query(sql, values, trx) as ResultSetHeader;
        return result.affectedRows;
    }

    async remove(id: number, trx?: Transaction) {
        return this.removeAll([id], trx);
    }

    async removeAll(ids: number[], trx?: Transaction) {
        const ctor = this.constructor as DAOC;
        return this.removeCustom({where: ctor.id.in(ids)}, trx);
    }

    async removeCustom(params: DeleteParams = {}, trx?: Transaction) {
        const values: QueryValues = [];
        const ctor = this.constructor as DAOC;
        if (!params.from) {
            params.from = ctor.table;
        }
        const sql = SQL.delete().fromParams(params).toSQL(values);
        const result = await this.db.query(sql, values, trx) as ResultSetHeader;
        return result.affectedRows;
    }

    async createBulk(items: T[], trx?: Transaction) {
        return this.insertCustom({objects: items}, trx);
    }


    async insertCustom(params: InsertParams = {}, trx?: Transaction) {
        const values: QueryValues = [];
        const ctor = this.constructor as DAOC;
        if (!params.into) {
            params.into = ctor.table;
        }
        const sql = SQL.insert().fromParams(params).toSQL(values);
        const result = await this.db.query(sql, values, trx) as ResultSetHeader;
        return result.insertId;
    }

    async findById(id: number, include?: Include[], trx?: Transaction) {
        const ctor = this.constructor as DAOC;
        return this.findOne({where: ctor.id.equal(id)}, include, trx);
    }

    async findAll(params: SelectParams = {}, include?: Include[], trx?: Transaction) {
        const values: QueryValues = [];
        const ctor = this.constructor as DAOC;
        if (!params.from) {
            params.from = ctor.table;
        }
        const sql = SQL.select().fromParams(params).toSQL(values);
        const result = await this.db.queryAll<T>(sql, values, trx);
        if (include) {
            await this.includeRelations(include, result, trx);
        }
        return result;
    }

    async findOne(params?: Params, include?: Include[], trx?: Transaction) {
        return (await this.findAll(params, include, trx)).pop();
    }

    async query(query: Expression, include?: Include[], trx?: Transaction) {
        const values: QueryValues = [];
        const result = await this.db.queryAll<T>(query.toSQL(values), values, trx);
        if (include) {
            await this.includeRelations(include, result, trx);
        }
        return result;
    }

    private async includeRelations(includes: Include[], result: T[], trx: Transaction) {
        for (let i = 0; i < includes.length; i++) {
            const include = includes[i];
            await this.processRelation(trx, include.relation, include.params, result, null, include.relation.property);
        }
    }

    protected async processRelation(trx: Transaction, relation: Relation, params: Params = {}, result: BaseType[], parentResult: BaseType[], property: string, parentSubItems?: BaseType[], parentAggregateFieldName?: string, parentFK?: string) {
        const isBelongs = relation.type == RelationType.BELONGS_TO;
        let modelDAO: DAOX;

        let aggregateFieldName: string;
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
        aggregateFieldName = isBelongs ? relation.foreignKey.toSQL() : from.id.toSQL();

        // todo: hasMany from parameters
        let isHasMany = relation.type == RelationType.HAS_MANY || relation.type == RelationType.HAS_MANY_THROUGH || parentSubItems;

        const ids = Array(result.length);

        const foreignKeyName = isBelongs ? model.id.toSQL() : relation.foreignKey.toSQL();
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

        const subResult = await modelDAO.findAll(localParams, trx);

        if (relation.through) {
            const modelDAO = inject(relation.through.model);
            await modelDAO.processRelation(trx, relation.through, params, subResult, result, property, subResult, aggregateFieldName, foreignKeyName);
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

    static field(name: string) {
        return SQL.attr(this.table, name);
    }

    static hasMany(cls: DDD, foreignKey: Identifier, property: string) {
        return new Relation(RelationType.HAS_MANY, this, cls, null, foreignKey, property)
    }

    static hasManyThrough(through: Relation, foreignKey: Identifier, property: string) {
        return new Relation(RelationType.HAS_MANY_THROUGH, this, null, through, foreignKey, property);
    }

    static hasOne(cls: DDD, foreignKey: Identifier, property: string) {
        return new Relation(RelationType.HAS_ONE, this, cls, null, foreignKey, property)
    }

    static hasOneThrough(through: Relation, foreignKey: Identifier, property: string) {
        return new Relation(RelationType.HAS_ONE_THROUGH, this, null, through, foreignKey, property)
    }

    static belongsTo(cls: DDD, foreignKey: Identifier, property: string) {
        return new Relation(RelationType.BELONGS_TO, this, cls, null, foreignKey, property)
    }
}


const enum RelationType {
    HAS_ONE, HAS_ONE_THROUGH, HAS_MANY, HAS_MANY_THROUGH, BELONGS_TO
}

interface DDD {
    new (): DAOX;
    table: Table;
    id: Identifier;
}

class Relation {
    type: RelationType;
    cls: DDD;
    model: DDD;
    through: Relation;
    fromx: DDD;
    property: string;

    foreignKey: Identifier;

    constructor(type: RelationType, from: DDD, cls: DDD, through: Relation, foreignKey: Identifier, property: string) {
        this.type = type;
        this.fromx = from;
        this.cls = cls;
        this.model = cls;
        this.through = through;
        this.foreignKey = foreignKey;
        this.property = property;
    }
}
