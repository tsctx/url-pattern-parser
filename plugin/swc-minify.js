/**
 * @import { type Plugin } from "rollup";
 * @import { type JsMinifyOptions } from "@swc/core";
 */

import { minify as swcMinify } from "@swc/core";

/**
 * @param {JsMinifyOptions} minifyOptions
 * @returns {Plugin}
 */
export default function minify(minifyOptions) {
  return {
    name: "plugin-swc-minify",
    renderChunk(code, _chunk, _options) {
      return swcMinify(code, {
        ...minifyOptions,
        sourceMap: true,
        compress: true,
        mangle: true,
      });
    },
  };
}
