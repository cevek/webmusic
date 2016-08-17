import {Table, updateSql, QueryValues} from "../query";
import {Test} from "tape";
import tape = require("tape");
const trackTable = new Table('Track');
const Track = {
    table: trackTable,
    error: trackTable.field('error'),
    info: trackTable.field('info'),
    duration: trackTable.field('duration'),
}

let values:QueryValues;
tape('query-generator', (t:Test)=> {
    t.test('update', t => {
        t.test('set', t => {
            values = [];
            const sql = updateSql({
                //todo flags: ['LOW_PRIORITY'],
                table: Track.table,
                set: [Track.error.assign(1), Track.info.assign(Track.info.plus(3))],
                where: Track.duration.equal(4).and(Track.error.equal(5)),
                order: Track.duration.desc(),
                limit: 10
            }, values);

            t.equal(sql, "UPDATE Track SET Track.error = ?, Track.info = Track.info + ? WHERE Track.duration = ? AND Track.error = ? ORDER BY Track.duration DESC LIMIT ?");
            t.deepEqual(values, [1, 3, 4, 5, 10]);
            t.end();
        })

        t.test('value', t => {
            values = [];
            const sql = updateSql({
                //todo flags: 'IGNORE',
                table: Track.table,
                value: {error: 1, duration: void 0, info: Track.info.plus(3)},
            }, values);

            t.equal(sql, "UPDATE Track SET error = ?, info = Track.info + ?");
            t.deepEqual(values, [1, 3]);
            t.end();
        })
    })
});

