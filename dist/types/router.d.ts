/**
 * Router using RegExp.
 */
declare class Router<T> {
    #private;
    constructor();
    add(method: string, path: string, ...handlers: T[]): void;
    match(method: string, path: string): {
        handlers: T[];
        params: Record<string, string>;
    } | null;
}
export { Router };
