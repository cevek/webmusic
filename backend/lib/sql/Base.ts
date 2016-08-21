export type Raw = string | number | boolean | Date;
export type RawValue = Raw | Raw[];
export type QueryValues = any[];

export class Base {
    private _base: Base;
    toSQL(values: QueryValues): string {
        return '';
    }
}

export class Statement extends Base {
    private _statement: Statement;

    constructor() {
        super();
    }
}



