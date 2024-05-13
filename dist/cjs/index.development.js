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

exports.parse = parse;
//# sourceMappingURL=index.development.js.map
