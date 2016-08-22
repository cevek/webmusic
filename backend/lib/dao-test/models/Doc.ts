import {DAO, Relation, hasMany, field, hasManyThrough} from "../../dao";
import {Chapter} from "./Chapter";
import {inject} from "../../injector";
import {Field} from "../../sql/DataSource";

export class Doc extends DAO<{}> {
    @field name: Field;

    @hasMany(()=>inject(Chapter).docId)
    chapters: Relation;

    @hasManyThrough(()=>inject(Chapter).paragraphs, ()=>inject(Chapter).docId)
    paragraphs: Relation;

    @hasManyThrough(()=>inject(Chapter).author, ()=>inject(Chapter).docId)
    authors: Relation;
}
