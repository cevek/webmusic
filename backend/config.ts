export class Config {
    db:{
        user:string,
        password:string,
        database:string
    }
    musicFilesDir:string;
    maxCapacity:number;
    limitConcurentProcess:number;
    trackDuration: number;
}