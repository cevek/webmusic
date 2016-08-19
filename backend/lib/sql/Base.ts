import {QueryValues} from "../query";
import {SelectQuery} from "./SelectQuery";
import {Expression} from "./Expression";
import {Table, Field} from "./DataSource";
export class SQL {
    select() {
        return new SelectQuery();
    }

    insertInto(): any {

    }

    update(): any {

    }

    replace(): any {

    }

    delete(): any {

    }

    table(name: string) {
        return new Table(new Identifier(name));
    }

    identifier(name: string) {
        return new Identifier(name);
    }

    attr(table: Table, name: string) {
        return new Field(table, name);
    }

    fun: any;
}

type Raw = string | number | boolean | Date;
export type RawValue = Raw | Raw[];

export class Base {
    toSQL(values: QueryValues): string {
        return '';
    }
}

export function toSQL(a: Base | RawValue, values: QueryValues) {
    return '';
}


export class Procedure extends Base {
    constructor(private name: Identifier, private args: Expression[]) {
        super();
    }

    toSQL(values: QueryValues) {
        return `${toSQL(this.name, values)}(${this.args.map(arg => toSQL(arg, values))})`;
    }
}

export class Identifier extends Expression {
    private _as: Identifier = null;

    constructor(protected name: string) {
        super();
    }

    as(as: Identifier) {
        this._as = as;
        return this;
    }

    toSQL(): string {
        return `\`${this.name}\`` + (this._as ? ` AS ${toSQL(this._as, null)}` : '');
    }
}

