import {QueryValues} from "../query";


type Raw = string | number | boolean | Date;
export type RawValue = Raw | Raw[];

export class Base {
    toSQL(values: QueryValues): string {
        return '';
    }
}




