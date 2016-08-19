import {Expression} from "../query";
import {Base, Identifier} from "./Base";


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
}

export class Join extends DataSource {
    constructor(public joinType: string, public tableFrom: DataSource, public tableTo: DataSource, public on: Expression) {
        super();
    }
}