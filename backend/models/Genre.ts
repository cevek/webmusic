import {DAO} from "../lib/dao";
import {StationDAO} from "./Station";
import {GenreStationDAO} from "./GenreStation";
export class Genre {
    id:number;
    name:string;
}

export class GenreDAO extends DAO<Genre> {
    table = 'genres';

    stations = this.addHasManyThroughRelation('stations', StationDAO, GenreStationDAO);
}
