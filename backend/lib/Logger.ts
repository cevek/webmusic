export class Logger {
    constructor(public name = 'main'){

    }
    log(...args:any[]) {
        const dt = new Date();
        const hours = ('0' + dt.getHours()).substr(-2);
        const minutes = ('0' + dt.getMinutes()).substr(-2);
        const seconds = ('0' + dt.getSeconds()).substr(-2);
        const ms = ('00' + dt.getMilliseconds()).substr(-3);

        console.log(`${hours}:${minutes}:${seconds}.${ms} ${this.name}`, ...args);
    }
}
