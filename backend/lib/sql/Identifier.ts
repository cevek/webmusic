import {Expression} from "./Expression";
export class Identifier extends Expression {
    constructor(protected name: string) {
        super();
    }

    toSQL(): string {
        return (this.name == '*' ? '*' : `\`${this.name.replace(/`/g, '``')}\``);
    }
}

