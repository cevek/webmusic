const diMap = new Map();
export function inject<T>(Class:new ()=>T):T {
    let val = diMap.get(Class);
    if (val) {
        return val;
    }
    val = new Class();
    diMap.set(Class, val);
    return val;
}

export function bindInjection<T>(Class:new ()=>T, value:T) {
    diMap.set(Class, value);
}