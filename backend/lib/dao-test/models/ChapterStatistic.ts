import {DAO} from "../../dao";
import {Table} from "../../query";
import {Paragraph} from "./Paragraph";
import {Author} from "./Author";
import {Doc} from "./Doc";
import {Chapter} from "./Chapter";
import {ChapterInfo} from "./ChapterInfo";

export class ChapterStatistic extends DAO<{}> {
    static table = new Table('ChapterStatistic');
    static id = ChapterStatistic.field('id');
    static Name = ChapterStatistic.field('name');
    static chapterInfoId = ChapterStatistic.field('chapterInfoId');

    static get rel() {
        return {
            chapterInfo: ChapterStatistic.belongsTo(ChapterInfo, ChapterStatistic.chapterInfoId, 'chapterInfo'),
        }
    }
}
