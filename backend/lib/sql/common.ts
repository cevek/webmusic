import {Base, RawValue} from "./Base";
import {QueryValues} from "../query";

export function toSql(a: Base | RawValue, values: QueryValues) {
    if (a instanceof Base) {
        return a.toSQL(values);
    }
    values.push(a);
    return '?';
}