import {DAO} from "../../dao";
import {Table} from "../../query";
import {Chapter} from "./Chapter";

export class Paragraph extends DAO<{}> {
    static table = new Table('Paragraph');
    static id = Paragraph.field('id');
    static Name = Paragraph.field('name');
    static chapterId = Paragraph.field('chapterId');


    static get rel() {
        return {
            chapter: Paragraph.belongsTo(Chapter, Paragraph.chapterId, 'chapter')
        }
    }
}
