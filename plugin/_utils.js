//@ts-check

/**
 *
 * @param {string} url
 */
export function createFileInfo(url) {
  const i = "win32" === process.platform;
  let m = new URL(url).pathname;
  return (
    // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
    // biome-ignore lint/style/noCommaOperator: <explanation>
    m.startsWith("/") && i && (m = m.slice(1)),
    {
      __dirname: m
        .split("/")
        .slice(0, -1)
        .join(i ? "\\" : "/"),
      __filename: m,
    }
  );
}

import { createRequire as createRequire$ } from "node:module";
import fs from "node:fs/promises";
import path from "node:path";
/**
 *
 * @param {string} url
 * @returns
 */
export function createRequire(url) {
  return createRequire$(url);
}
/**
 *
 * @param {string} appDist
 * @returns
 */
export function cleanDistFolder(appDist) {
  return fs.unlink(appDist);
}

/**
 * @param {string} name
 * @param {string} appDist
 * @param {string} [filename]
 */
export async function writeCjsEntryFile(name, appDist, filename) {
  const contents = `
'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./cjs/${name}.production.min.js');
} else {
  module.exports = require('./cjs/${name}.development.js');
}
`.trimStart();
  await fs.mkdir(path.dirname(path.join(appDist, filename || "index.cjs")), {
    recursive: true,
  });
  return fs.writeFile(path.join(appDist, filename || "index.cjs"), contents);
}

/**
 * @param {string} name
 * @param {string} appDist
 * @param {string} [filename]
 */
export async function writeMjsEntryFile(name, appDist, filename) {
  const contents = `
export { default } from './esm/${name}.js';
export * from './esm/${name}.js';
  `.trimStart();
  await fs.mkdir(path.dirname(path.join(appDist, filename || "index.mjs")), {
    recursive: true,
  });
  return fs.writeFile(path.join(appDist, filename || "index.mjs"), contents);
}
/**
 *
 * @param {string} appDist
 */
export async function writeCjsPackageJson(appDist) {
  await fs.mkdir(path.dirname(path.join(appDist, "package.json")), {
    recursive: true,
  });
  return fs.writeFile(
    path.join(appDist, "package.json"),
    '{"type":"commonjs"}',
  );
}
