import {DAO} from "../../dao";
import {Chapter} from "./Chapter";
import {SQL} from "../../sql/sql";

export class Paragraph extends DAO<{}> {
    static table = SQL.table('Paragraph');
    static id = Paragraph.field('id');
    static Name = Paragraph.field('name');
    static chapterId = Paragraph.field('chapterId');


    static get rel() {
        return {
            chapter: Paragraph.belongsTo(Chapter, Paragraph.chapterId, 'chapter')
        }
    }
}
