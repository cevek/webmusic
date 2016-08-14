import {DAO} from "../../dao";
import {Table} from "../../query";
import {Chapter} from "./Chapter";

export class Doc extends DAO<{}> {
    static table = new Table('Doc');
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
