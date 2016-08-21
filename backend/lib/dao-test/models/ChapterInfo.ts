import {DAO} from "../../dao";
import {Chapter} from "./Chapter";
import {ChapterStatistic} from "./ChapterStatistic";
import {SQL} from "../../sql/index";

export class ChapterInfo extends DAO<{}> {
    static table = SQL.table('ChapterInfo');
    static id = ChapterInfo.field('id');
    static Name = ChapterInfo.field('name');
    static chapterId = ChapterInfo.field('chapterId');

    static get rel() {
        return {
            chapter: ChapterInfo.belongsTo(Chapter, ChapterInfo.chapterId, 'chapter'),
            statistic: ChapterInfo.hasOne(ChapterStatistic, ChapterStatistic.chapterInfoId, 'statistic'),
        }
    }
}
