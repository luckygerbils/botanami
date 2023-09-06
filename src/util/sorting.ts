export function dateCompare(d1: Date, d2: Date) {
    return Number(d1) - Number(d2);
}

// Sort true before false
export function booleanCompare(a: boolean, b: boolean) {
    return a ? (b ? 0 : -1) : (b ? 1 : 0); 
}

export function reversed<T>(compareFn: (a: T, b: T) => number) {
    return (a: T, b: T) => compareFn(b, a);
}

export function compareChain<T>(chain: ((t1: T, t2: T) => number)[]) {
    return function(result1: T, result2: T) {
        for (const entry of chain) {
            const result = entry(result1, result2);
            if (result !== 0) {
                return result;
            }
        }
        return 0;
    }
}