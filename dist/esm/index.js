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

export { parse };
export default {};
//# sourceMappingURL=index.js.map
