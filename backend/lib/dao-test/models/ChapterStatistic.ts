import {DAO, Relation, field, belongsTo} from "../../dao";
import {ChapterInfo} from "./ChapterInfo";
import {inject} from "../../injector";
import {Field} from "../../sql/DataSource";

export class ChapterStatistic extends DAO<{}> {
    @field name: Field;
    @field chapterInfoId: Field;

    @belongsTo(()=>inject(ChapterInfo).id, ()=>inject(ChapterStatistic).chapterInfoId)
    chapterInfo: Relation;
}
