import {DAO, field, Relation, hasMany, hasManyThrough} from "../../dao";
import {Chapter} from "./Chapter";
import {Field} from "../../sql/DataSource";
import {inject} from "../../injector";

export class Author extends DAO<{}> {
    @field name: Field;

    @hasMany(()=>inject(Chapter).authorId)
    chapters: Relation;

    @hasManyThrough(()=>inject(Chapter).paragraphs, ()=>inject(Chapter).authorId)
    paragraphs: Relation;
}
