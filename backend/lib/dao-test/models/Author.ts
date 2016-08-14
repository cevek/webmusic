import {DAO} from "../../dao";
import {Table} from "../../query";
import {Chapter} from "./Chapter";

export class Author extends DAO<{}> {
    static table = new Table('Author');
    static id = Author.field('id');
    static Name = Author.field('name');

    static get rel() {
        return {
            chapters: Author.hasMany(Chapter, Chapter.authorId, 'chapters'),
            paragraphs: Author.hasManyThrough(Chapter.rel.paragraphs, Chapter.authorId, 'paragraphs'),
        }
    }
}
