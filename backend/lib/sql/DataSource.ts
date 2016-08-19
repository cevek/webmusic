import {Base, Identifier, toSQL} from "./Base";
import {Expression} from "./Expression";


export class DataSource extends Base {
    private _partition: Identifier[] = null;
    private _name: Identifier = null;

    constructor() {
        super();
    }

    partition(expr: Identifier | Identifier[]) {
        this._partition = expr instanceof Array ? expr : [expr];
        return this;
    }

    join(table: DataSource, on: Expression) {
        return new Join('INNER', this, table, on);
    }

    leftJoin(table: DataSource, on: Expression) {
        return new Join('LEFT', this, table, on)
    }

    rightJoin(table: DataSource, on: Expression) {
        return new Join('RIGHT', this, table, on);
    }

    outerJoin(table: DataSource, on: Expression) {
        return new Join('OUTER', this, table, on);
    }

    as(name: Identifier) {
        this._name = name;
        return this;
    }

    toSQL() {
        //todo:
        return ``;
    }
}

export class Table extends DataSource {
    constructor(private name: Identifier) {
        super();
    }

    all() {
        return new Field(this, '*');
    }

    toSQL() {
        return toSQL(this.name, null);
    }
}

export class Join extends DataSource {
    constructor(private joinType: string, private tableFrom: DataSource, private tableTo: DataSource, private on: Expression) {
        super();
    }

    toSQL() {
        return `${toSQL(this.tableFrom, null)} ${this.joinType} JOIN ${toSQL(this.tableFrom, null)} ON (${toSQL(this.on, null)})`;
    }
}

export class RawSQL extends Base {
    constructor(private sql: string) {
        super();
    }

    toSQL() {
        return this.sql;
    }
}

export class Field extends Identifier {
    constructor(private table: Table, private fieldName: string) {
        super(fieldName);
    }

    toSQL() {
        return `${toSQL(this.table, null)}.${toSQL(this.fieldName == '*' ? new RawSQL('*') : this.name, null)}`;
    }
}