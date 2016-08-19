import {QueryValues} from "../query";
import {SQL} from "./Base";


var sql = new SQL();
var table = sql.table('a');
var table2 = sql.table('b');
var id = sql.attr('id');
var title = sql.attr('title');






sql
    .select()
    .attrs([
        '*',
        table.all(),
        id,
        id.as('foo'),
        sql.fun.MAX('y', id)
    ])
    .directive.ALL()
    .directive.DISTINCT()
    .from(table.as('tbl')
        .leftJoin(table2).on(
            id.equal(id).and(id.greatThan(10))
        )
    )
    .where(
        id.greatThan(10).and(title.like("foo"))
    )
    .groupBy(
        id
    )
    .having(
        id
    )
    .orderBy([id.desc()])
    .limit(1, 2);

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
