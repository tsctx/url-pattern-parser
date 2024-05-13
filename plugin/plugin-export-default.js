//@ts-check

/**
 * @typedef {{
 *   isEsm: boolean;
 * }} ExportDefaultPluginOptions
 */

/**
 * @param {ExportDefaultPluginOptions | boolean} options
 * @returns {import("rollup").Plugin}
 */
export default function exportDefaultPlugin(options) {
  const isEsm =
    typeof options === "boolean"
      ? options
      : (options ?? { isEsm: false }).isEsm;
  return {
    name: "plugin-export-default",
    async renderChunk(code, chunk) {
      if (chunk.exports.includes("default") || !isEsm) {
        return null;
      }

      return {
        code: `${code}\nexport default {};`,
        map: null,
      };
    },
  };
}
