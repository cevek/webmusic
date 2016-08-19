import {toSql} from "./common";
import {Expression} from "./Expression";
export class Identifier extends Expression {
    private _as: Identifier = null;

    constructor(protected name: string) {
        super();
    }

    as(as: Identifier) {
        const identifier = new Identifier(this.name);
        identifier._as = as;
        return identifier;
    }

    toSQL(): string {
        return (this.name == '*' ? '*' : `\`${this.name}\``) + (this._as ? ` AS ${toSql(this._as, null)}` : '');
    }
}

