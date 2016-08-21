import {DAO} from "../../dao";
import {Chapter} from "./Chapter";
import {SQL} from "../../sql/sql";

export class Doc extends DAO<{}> {
    static table = SQL.table('Doc');
    static id = Doc.field('id');
    static Name = Doc.field('name');

    static get rel() {
        return {
            chapters: Doc.hasMany(Chapter, Chapter.docId, 'chapters'),
            paragraphs: Doc.hasManyThrough(Chapter.rel.paragraphs, Chapter.docId, 'paragraphs'),
            authors: Doc.hasManyThrough(Chapter.rel.author, Chapter.docId, 'authors'),
        }
    }
}
