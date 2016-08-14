import {DAO} from "../../dao";
import {Table} from "../../query";
import {Paragraph} from "./Paragraph";
import {Author} from "./Author";
import {Doc} from "./Doc";
import {Chapter} from "./Chapter";
import {ChapterStatistic} from "./ChapterStatistic";

export class ChapterInfo extends DAO<{}> {
    static table = new Table('ChapterInfo');
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
