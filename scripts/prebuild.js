//@ts-check
import { unlink, rm } from "node:fs/promises";
import path from "node:path";
import { createFileInfo } from "../plugin/_utils.js";
import { entries } from "../rollup.config.js";
const { __dirname } = createFileInfo(import.meta.url);

/**@param {string} file */
const getPath = (file) => path.resolve(__dirname, file);

/**@param {string} file */
const tryRemove = (file) => {
  return unlink(getPath(file)).catch(() => null);
};

/**@param {string} file */
const tryRemoveDir = (file) => {
  return rm(getPath(file), { recursive: true }).catch(() => null);
};

Promise.all([
  tryRemoveDir("../dist/esm"),
  tryRemoveDir("../dist/cjs"),
  entries.flatMap((name) => [
    tryRemove(`../dist/${name}.cjs`),
    tryRemove(`../dist/${name}.mjs`),
  ]),
]).catch((err) => {
  console.error(err);
  process.exit(1);
});
