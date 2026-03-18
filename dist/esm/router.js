/**
 * @license url-pattern-parser.js v0.0.1
 *
 * Copyright (c) tsctx All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
function parse(str) {
    const keys = [];
    return {
        keys,
        pattern: new RegExp(`^${(str[0] === "/" ? str.slice(1) : str).split("/").reduce((pattern, part)=>{
            if (part === "*") {
                pattern += part[part.length - 1] === "?" ? "(?:/(?:.*))?" : "/(?:.*)";
            } else if (part[0] === ":") {
                const optionally = part[part.length - 1] === "?";
                pattern += optionally ? "(?:/([^/]+?))?" : "/([^/]+?)";
                keys.push(part.slice(1, optionally ? part.length - 1 : part.length));
            } else {
                pattern += `/${escapeRegExp(part)}`;
            }
            return pattern;
        }, "")}/?$`, "i")
    };
}
function escapeRegExp(str) {
    return str.replace(/[\\*+.?{}()[\]^$\-|/]/g, "\\$&");
}

// Pattern's parser
/**
 * Router using RegExp.
 */ class Router {
    #routes;
    constructor(){
        this.#routes = Object.setPrototypeOf({
            ALL: []
        }, null);
    }
    add(method, path, ...handlers) {
        const pattern = parse(path);
        const info = {
            pattern,
            handlers
        };
        if (method === "ALL") {
            const keys = Object.keys(this.#routes);
            for(let i = 0; i < keys.length; ++i){
                this.#routes[keys[i]].push(info);
            }
        } else {
            if (typeof this.#routes[method] === "undefined") {
                this.#routes[method] = this.#routes.ALL.slice();
            }
            this.#routes[method].push(info);
        }
    }
    match(method, path) {
        const handlers = [];
        const params = [];
        const target = this.#routes[method] ?? this.#routes.ALL;
        for(let i = 0; i < target.length; ++i){
            const { pattern: { pattern, keys }, handlers: targetHandler } = target[i];
            if (pattern.test(path)) {
                handlers.push(...targetHandler);
                const match = pattern.exec(path);
                if (match !== null) {
                    const param = Object.create(null);
                    for(let j = 0; j < keys.length; ++j){
                        param[keys[j]] = match[j + 1];
                    }
                    params.push(param);
                }
            }
        }
        if (handlers.length !== 0) {
            return {
                handlers: handlers,
                params: params
            };
        }
        return null;
    }
}

export { Router };
export default {};
//# sourceMappingURL=router.js.map
