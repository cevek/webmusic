import {DAO} from "../../dao";
import {Paragraph} from "./Paragraph";
import {Author} from "./Author";
import {Doc} from "./Doc";
import {ChapterInfo} from "./ChapterInfo";
import {SQL} from "../../sql/index";

export class Chapter extends DAO<{}> {
    static table =SQL.table('Chapter');
    static id = Chapter.field('id');
    static Name = Chapter.field('name');
    static authorId = Chapter.field('authorId');
    static docId = Chapter.field('docId');

    static get rel() {
        return {
            paragraphs: Chapter.hasMany(Paragraph, Paragraph.chapterId, 'paragraphs'),
            author: Chapter.belongsTo(Author, Chapter.authorId, 'author'),
            doc: Chapter.belongsTo(Doc, Chapter.docId, 'doc'),
            statistic: Chapter.hasOneThrough(ChapterInfo.rel.statistic, ChapterInfo.chapterId, 'statistic'),
        }
    }
}
