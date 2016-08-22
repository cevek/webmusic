import {DAO, Relation, field, belongsTo} from "../../dao";
import {Chapter} from "./Chapter";
import {inject} from "../../injector";
import {Field} from "../../sql/DataSource";

export class Paragraph extends DAO<{}> {
    @field name: Field;
    @field chapterId: Field;

    @belongsTo(()=>inject(Chapter).id, ()=>inject(Paragraph).chapterId)
    chapter: Relation;
}
