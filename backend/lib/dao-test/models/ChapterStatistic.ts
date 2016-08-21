import {DAO} from "../../dao";
import {ChapterInfo} from "./ChapterInfo";
import {SQL} from "../../sql/sql";

export class ChapterStatistic extends DAO<{}> {
    static table = SQL.table('ChapterStatistic');
    static id = ChapterStatistic.field('id');
    static Name = ChapterStatistic.field('name');
    static chapterInfoId = ChapterStatistic.field('chapterInfoId');

    static get rel() {
        return {
            chapterInfo: ChapterStatistic.belongsTo(ChapterInfo, ChapterStatistic.chapterInfoId, 'chapterInfo'),
        }
    }
}
