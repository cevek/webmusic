"use strict";
import {DB} from "./db";
import {Transaction} from "./Transaction";
import {inject} from "./injector";
import {ResultSetHeader} from "./Connection";
import {QueryValues} from "./sql/Base";
import {SQL} from "./sql/index";
import {Field, Table} from "./sql/DataSource";
import {Expression} from "./sql/Expression";
import {Identifier} from "./sql/Identifier";
import {UpdateParams} from "./sql/statements/Update";
import {DeleteParams} from "./sql/statements/Delete";
import {InsertParams} from "./sql/statements/Insert";
import {Select} from "./sql/statements/Select";

interface Include {
    relation: Relation;
    params?: SelectParamsWithInclude;
}

interface BaseType {
    // id:number;
}

interface SelectParamsWithInclude extends Select {
    include?: Include[];
}

export class DAO<T extends BaseType> {
    private __table: Table;
    get table(): Table {
        return this.__table || (this.__table = new Table(new Identifier(this.constructor.name)));
    }

    private __id: Field;
    get id(): Field {
        return this.__id || (this.__id = new DAOField(this, 'id'));
    }

    protected db = inject(DB);

    async create(item: T, trx?: Transaction) {
        return await this.createBulk([item], trx);
    }

    async update(item: T, id: number, trx?: Transaction) {
        return this.updateCustom({object: item, where: this.id.equal(id)}, trx);
    }

    async updateCustom(params: UpdateParams = {}, trx?: Transaction) {
        const values: QueryValues = [];
        if (!params.table) {
            params.table = this.table;
        }
        const sql = SQL.update().fromParams(params).toSQL(values);
        const result = await this.db.query(sql, values, trx) as ResultSetHeader;
        return result.affectedRows;
    }

    async remove(id: number, trx?: Transaction) {
        return this.removeAll([id], trx);
    }

    async removeAll(ids: number[], trx?: Transaction) {
        return this.removeCustom({where: this.id.in(ids)}, trx);
    }

    async removeCustom(params: DeleteParams = {}, trx?: Transaction) {
        const values: QueryValues = [];
        if (!params.from) {
            params.from = this.table;
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
        if (!params.into) {
            params.into = this.table;
        }
        const sql = SQL.insert().fromParams(params).toSQL(values);
        const result = await this.db.query(sql, values, trx) as ResultSetHeader;
        return result.insertId;
    }

    async findById(id: number, trx?: Transaction) {
        return this.findOne({where: this.id.equal(id)}, trx);
    }

    async findAll(params: SelectParamsWithInclude = {}, trx?: Transaction) {
        const values: QueryValues = [];
        if (!params.from) {
            params.from = this.table;
        }
        const sql = SQL.select().fromParams(params).toSQL(values);
        const result = await this.db.queryAll<T>(sql, values, trx);
        if (params.include) {
            await this.includeRelations(params.include, result, trx);
        }
        return result;
    }

    async findOne(params?: SelectParamsWithInclude, trx?: Transaction) {
        return (await this.findAll(params, trx)).pop();
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

    protected async processRelation(trx: Transaction, relation: Relation, params: SelectParamsWithInclude = {}, result: BaseType[], parentResult: BaseType[], property: string, parentSubItems?: BaseType[], parentAggregateFieldName?: string, parentFK?: string) {
        const isBelongs = relation.type == RelationType.BELONGS_TO;
        let aggregateFieldName: string;
/*
        const through = relation.throughFn && relation.throughFn();
        const selfKey = through ? through.selfKeyFn() : relation.selfKeyFn();
        const foreignKey = through ? through.foreignKeyFn() : relation.foreignKeyFn();
        const modelDAO = through ? selfKey.dao : foreignKey.dao;
*/
        const through = relation.throughFn && relation.throughFn();
        const selfKey = relation.selfKeyFn();
        const foreignKey = relation.foreignKeyFn();
        const modelDAO = foreignKey.dao;
        // aggregateFieldName = isBelongs ? foreignKey.toSQL() : modelDAO.id.toSQL();
        aggregateFieldName = selfKey.DAOFieldName;

        // todo: hasMany from parameters
        let isHasMany = relation.type == RelationType.HAS_MANY || relation.type == RelationType.HAS_MANY_THROUGH || parentSubItems;

        const ids = Array(result.length);

        // const foreignKeyName = isBelongs ? modelDAO.id.toSQL() : relation.foreignKey.toSQL();
        const foreignKeyName = foreignKey.DAOFieldName;
        // console.log('aggregateFieldName', aggregateFieldName);
        // console.log('foreignKeyName', foreignKeyName);


        for (let i = 0; i < result.length; i++) {
            ids[i] = result[i][aggregateFieldName];
        }

        const cond = foreignKey.in(ids);
        let localParams = params;
        if (relation.throughFn) {
            localParams = {where: cond};
        } else {
            let where = localParams.where && (localParams.where instanceof Array ? localParams.where : [localParams.where]);
            if (!where) {
                where = localParams.where = [];
            }
            where.push(cond);
        }

        const subResult = await modelDAO.findAll(localParams, trx);

        if (through) {
            const modelDAO = relation.foreignKeyFn().dao;
            await modelDAO.processRelation(trx, through, params, subResult, result, property, subResult, aggregateFieldName, foreignKeyName);
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
}


const enum RelationType {
    HAS_ONE, HAS_ONE_THROUGH, HAS_MANY, HAS_MANY_THROUGH, BELONGS_TO
}

export class Relation {
    type: RelationType;
    throughFn: () => Relation;
    property: string;

    selfKeyFn: () => DAOField;
    foreignKeyFn: () => DAOField;

    constructor(type: RelationType, selfKeyFn: ()=>DAOField, throughFn: () => Relation, foreignKeyFn: ()=>DAOField, property: string) {
        this.type = type;
        this.throughFn = throughFn;
        this.selfKeyFn = selfKeyFn;
        this.foreignKeyFn = foreignKeyFn;
        this.property = property;
    }
}

class DAOField extends Field {
    constructor(public dao: DAO<{}>, public DAOFieldName: string) {
        super(dao.table, DAOFieldName);
    }
}

export function field(target: any, property: string) {
    const prop = '__' + property;
    Object.defineProperty(target, property, {
        get: eval(`(function(){return this.${prop} || (this.${prop} = new ${DAOField.name}(this, "${property}"))})`)
    })
}

function rel(type: RelationType, foreignKeyFn: ()=>Field, selfKeyFn: () => Field, through: () => Relation) {
    return (target: any, property: string)=> {
        if (!selfKeyFn) {
            selfKeyFn = () => inject(target.constructor as typeof DAO).id;
        }
        const rel = new Relation(type, selfKeyFn as ()=>DAOField, through, foreignKeyFn as ()=>DAOField, property);
        Object.defineProperty(target, property, {
            get: () => rel
        });
    }
}

// Track.stationId, Station.id
export function hasMany(foreignKeyFn: () => Field, selfKeyFn?: () => Field) {
    return rel(RelationType.HAS_MANY, foreignKeyFn, selfKeyFn, null);
}

// GenreStation.genres, GenreStation.stationId, Station.id
export function hasManyThrough(through: () => Relation, foreignKeyFn: ()=>Field, selfKeyFn?: () => Field) {
    return rel(RelationType.HAS_MANY_THROUGH, foreignKeyFn, selfKeyFn, through);
}

export function hasOne(foreignKeyFn: () => Field, selfKeyFn?: () => Field) {
    return rel(RelationType.HAS_ONE, foreignKeyFn, selfKeyFn, null);
}

//
export function hasOneThrough(through: () => Relation, foreignKeyFn: () => Field, selfKeyFn?: () => Field) {
    return rel(RelationType.HAS_ONE_THROUGH, foreignKeyFn, selfKeyFn, through);
}

// Station.id, Track.stationId
export function belongsTo(foreignKeyFn: () => Field, selfKeyFn: () => Field) {
    return rel(RelationType.BELONGS_TO, foreignKeyFn, selfKeyFn, null);
}
