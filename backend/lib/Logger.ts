export class Logger {
    constructor(public name = 'main') {

    }

    private _log(method: Function, args: any[]){
        const dt = new Date();
        const hours = ('0' + dt.getHours()).substr(-2);
        const minutes = ('0' + dt.getMinutes()).substr(-2);
        const seconds = ('0' + dt.getSeconds()).substr(-2);
        const ms = ('00' + dt.getMilliseconds()).substr(-3);
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (arg instanceof Error) {
                args[i] = arg.stack;
            }
        }
        method(`${hours}:${minutes}:${seconds}.${ms} ${this.name}`, ...args);
    }

    log(...args:any[]) {
        this._log(console.log, args);
    }

    error(...args:any[]) {
        this._log(console.error, args);
    }
}
