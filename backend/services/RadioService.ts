export class RadioService {
    constructor(public id:number, public name:string, public domain:string) {
    }
}

export const radioServices = new Map<number, RadioService>([
    new RadioService(1, 'di', 'di.fm'),
    new RadioService(2, 'rt', 'radiotunes.com'),
].map(rs => [rs.id, rs]) as [number, RadioService][]);
