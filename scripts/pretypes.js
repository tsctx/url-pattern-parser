//@ts-check
import { rm } from "node:fs/promises";
import path from "node:path";
import { createFileInfo } from "../plugin/_utils.js";

const { __dirname } = createFileInfo(import.meta.url);

/**@param {string} file */
const getPath = (file) => path.resolve(__dirname, file);

/**@param {string} file */
const tryRemove = (file) => {
  return rm(getPath(file), { recursive: true }).catch(() => null);
};

tryRemove("../dist/types").catch((err) => {
  console.error(err);
  process.exit(1);
});
