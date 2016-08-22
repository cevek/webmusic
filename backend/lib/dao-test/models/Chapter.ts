import {DAO, Relation, hasMany, field, hasOneThrough, belongsTo} from "../../dao";
import {Paragraph} from "./Paragraph";
import {Author} from "./Author";
import {Doc} from "./Doc";
import {ChapterInfo} from "./ChapterInfo";
import {inject} from "../../injector";
import {Field} from "../../sql/DataSource";

export class Chapter extends DAO<{}> {
    @field name: Field;
    @field authorId: Field;
    @field docId: Field;

    @hasMany(()=>inject(Paragraph).chapterId)
    paragraphs: Relation;

    @belongsTo(()=>inject(Author).id, ()=>inject(Chapter).authorId)
    author: Relation;

    @belongsTo(()=>inject(Doc).id, ()=>inject(Chapter).docId)
    doc: Relation;

    @hasOneThrough(()=>inject(ChapterInfo).statistic, ()=>inject(ChapterInfo).chapterId)
    statistic: Relation;
}
