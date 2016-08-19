import {toSql} from "./common";
import {QueryValues} from "../query";
import {Expression} from "./Expression";
import {Base} from "./Base";
import {Identifier} from "./Identifier";
export class Procedure extends Base {
    constructor(private name: Identifier, private args: Expression[]) {
        super();
    }

    toSQL(values: QueryValues) {
        return `${toSql(this.name, values)}(${this.args.map(arg => toSql(arg, values))})`;
    }
}