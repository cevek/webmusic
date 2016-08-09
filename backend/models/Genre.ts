import {DAO} from "../lib/dao";
import {DB} from "../lib/db";
export class Genre {
    id:number;
    name:string;
}

export class GenreDAO extends DAO<Genre> {
    constructor(db: DB){
        super(db, 'genres', Genre);
    }
}
