import {DAO} from "../lib/dao";
import {GenreStationDAO} from "./GenreStation";
import {Genre, GenreDAO} from "./Genre";
import {StationInfo, StationInfoDAO} from "./StationInfo";
export class Station {
    id:number;
    name:string;

    genres:Genre[];

    info:StationInfo;

    urls:string[];
    needToConvert:boolean;
}

export class StationDAO extends DAO<Station> {
    table = this.setTable('stations');
    name = this.addField('name');
    genres = this.addHasManyThroughRelation('genres', GenreDAO, GenreStationDAO);
    info = this.addHasManyRelation('info', StationInfoDAO);
}
