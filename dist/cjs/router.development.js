/**
 * @license url-pattern-parser.js v0.0.1
 *
 * Copyright (c) tsctx All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */
'use strict';

function parse(str) {
    const keys = [];
    return {
        keys,
        pattern: new RegExp(`${(str[0] === "/" ? str.slice(1) : str).split("/").reduce((pattern, part)=>{
            if (part === "*") {
                // biome-ignore lint/style/noParameterAssign: <explanation>
                pattern += "/(?:.*)";
            } else if (part[0] === ":") {
                const optionally = part[part.length - 1] === "?";
                // biome-ignore lint/style/noParameterAssign: <explanation>
                pattern += optionally ? "(?:/([^/]+?))?" : "/([^/]+?)";
                keys.push(part.slice(1, optionally ? part.length - 1 : part.length));
            } else {
                // biome-ignore lint/style/noParameterAssign: <explanation>
                pattern += `/${escapeRegExp(part)}`;
            }
            return pattern;
        })}/?$`, "i")
    };
}
function escapeRegExp(str) {
    return str.replace(/[\\\*\+\.\?\{\}\(\)\[\]\^\$\-\|\/]/g, "\\$&");
}

// Pattern's parser
/**
 * Router using RegExp.
 */ class Router {
    #routes;
    constructor(){
        this.#routes = Object.create(null);
        this.#routes.ALL = [];
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
        const params = Object.create(null);
        const target = this.#routes[method] ?? this.#routes.ALL;
        for(let i = 0; i < target.length; ++i){
            const { pattern: { pattern, keys }, handlers: targetHandler } = target[i];
            if (pattern.test(path)) {
                handlers.push(...targetHandler);
                const match = pattern.exec(path);
                if (match !== null) {
                    for(let j = 0; j < keys.length; ++j){
                        params[keys[j]] = match[j + 1];
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

exports.Router = Router;
//# sourceMappingURL=router.development.js.map
