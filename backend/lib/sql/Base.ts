import {QueryValues} from "../query";
import {SelectQuery} from "./SelectQuery";
import {Expression} from "./Expression";
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
        return new Identifier(name);
    }

    attr(name: string) {
        return new Identifier(name);
    }

    fun: any;
}

export type RawValue = string | number | Date;

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

    constructor(private name: string) {
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

