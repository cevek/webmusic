import {DAO} from "../../dao";
import {Chapter} from "./Chapter";
import {SQL} from "../../sql/index";

export class Author extends DAO<{}> {
    static table = SQL.table('Author');
    static id = Author.field('id');
    static Name = Author.field('name');

    static get rel() {
        return {
            chapters: Author.hasMany(Chapter, Chapter.authorId, 'chapters'),
            paragraphs: Author.hasManyThrough(Chapter.rel.paragraphs, Chapter.authorId, 'paragraphs'),
        }
    }
}
