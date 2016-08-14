import {DAO} from "../../dao";
import {Table} from "../../query";
import {Paragraph} from "./Paragraph";
import {Author} from "./Author";
import {Doc} from "./Doc";
import {ChapterInfo} from "./ChapterInfo";

export class Chapter extends DAO<{}> {
    static table = new Table('Chapter');
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
