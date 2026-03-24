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
                // TODO: segment /([^\]+?)\.([^/]+?)
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
const EMPTY_PARAMS = Object.freeze(Object.create(null));
/**
 * Router using RegExp.
 */ class Router {
    #routes;
    constructor(){
        //@ts-expect-error
        this.#routes = {
            __proto__: null,
            ALL: []
        };
    }
    add(method, path, ...handlers) {
        const pattern = /[:({+*]/.test(path) ? parse(path) : null;
        const info = {
            path,
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
            const { path: targetPath, pattern: targetPattern, handlers: targetHandler } = target[i];
            if (targetPattern === null) {
                if (path === targetPath) {
                    params.push(EMPTY_PARAMS);
                    handlers.push(...targetHandler);
                }
            } else {
                const { pattern, keys } = targetPattern;
                const matched = pattern.exec(path);
                if (matched !== null) {
                    handlers.push(...targetHandler);
                    if (keys.length === 0) {
                        params.push(EMPTY_PARAMS);
                    } else {
                        const param = {
                            __proto__: null
                        };
                        for(let j = 0; j < keys.length; ++j){
                            param[keys[j]] = matched[j + 1];
                        }
                        params.push(param);
                    }
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
