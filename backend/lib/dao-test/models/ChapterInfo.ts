import {DAO, Relation, field, belongsTo, hasOne} from "../../dao";
import {Chapter} from "./Chapter";
import {ChapterStatistic} from "./ChapterStatistic";
import {inject} from "../../injector";
import {Field} from "../../sql/DataSource";

export class ChapterInfo extends DAO<{}> {
    @field name: Field;
    @field chapterId: Field;

    @belongsTo(()=>inject(Chapter).id, ()=>inject(ChapterInfo).chapterId)
    chapter: Relation;

    @hasOne(()=>inject(ChapterStatistic).chapterInfoId)
    statistic: Relation;
}
