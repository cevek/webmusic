import {SelectQuery} from "./SelectQuery";
import {Field, Table, RawSQL} from "./DataSource";
import {Identifier} from "./Identifier";
import {Functions} from "./Functions";
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

    all(){
        return new RawSQL('*');
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

    fun = Functions;

    default = new RawSQL('DEFAULT')
}
/*

 sql
 .update(table)
 .set([id.assign(1), title.assign(id.plus(10))])
 .where(

 )
 .orderBy()
 .limit();


 sql
 .insertInto()
 .directive.NO_CACHE()
 .partitions(['sd'])
 .values()
 .onDuplicateKeyUpdate()

 sql
 .replace()
 */
