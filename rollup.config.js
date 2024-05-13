// @ts-check
// Plugins
import { defineConfig } from "rollup";
import nodeResolve from "@rollup/plugin-node-resolve";
import cjs from "@rollup/plugin-commonjs";
import exd from "./plugin/plugin-export-default.js";
import {
  createFileInfo,
  createRequire,
  writeCjsEntryFile,
  writeCjsPackageJson,
} from "./plugin/_utils.js";

// https://github.com/privatenumber/minification-benchmarks
import terser from "@rollup/plugin-terser";
import swc, {
  defineRollupSwcOption,
  defineRollupSwcMinifyOption,
} from "rollup-plugin-swc3";

import path from "node:path";
import { writeMjsEntryFile } from "./plugin/_utils.js";
const { __dirname, __filename } = createFileInfo(import.meta.url);
const require = createRequire(import.meta.url);

// import pkg from "./package.json" assert { type: "json" };
const pkg = require("./package.json");

//@ts-ignore
const moduleName = pkg.moduleName || pkg.name;

const basicBanner = `/**
 * @license ${moduleName}.js v${pkg.version}
 *${
   //@ts-expect-error
   pkg.homepage ? ` ${pkg.homepage} \n *` : ""
 }
 * ${
   //@ts-expect-error
   pkg.company
     ? //@ts-expect-error
       `Copyright (c) ${pkg.company} and its affiliates.`
     : `Copyright (c) ${pkg.author} All rights reserved.`
 }
 *
 * This source code is licensed under the ${pkg.license} license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */`;
const minifyBanner = `/** @license ${moduleName}.js v${pkg.version} Released under the ${pkg.license} License. */`;

/**@type {import("rollup").Plugin[]} */
const GlobalInputPlugins = [
  /*
  ts({
    tsconfig: path.resolve(__dirname, "tsconfig.json"),
  }),
  //*/
  swc(
    createSWCOptions({
      minify: false,
      sourcemap: true,
    }),
  ),
  cjs({
    extensions: [".js", ".ts", ".jsx", ".tsx"],
    // exclude: [],
  }),
  nodeResolve({
    moduleDirectories: ["node_modules"],
    preferBuiltins: true,
  }),
];

/**@type {import("rollup").Plugin[]} */
const Output_RawPlugins = [];

/**@type {import("rollup").Plugin[]} */
const Output_Es_RawPlugins = [];

/**@type {import("rollup").Plugin[]} */
const Output_Cjs_RawPlugins = [];

/**@type {import("rollup").Plugin[]} */
const Output_MinifyPlugins = [];

/**@type {import("rollup").Plugin[]} */
const Output_Es_MinifyPlugins = [
  terser({
    module: true,
  }),
];

/**@type {import("rollup").Plugin[]} */
const Output_Cjs_MinifyPlugins = [terser({ module: false })];

/**@type {import("rollup").Plugin[]} */
const Input_Cjs_Plugins = [];

/**@type {import("rollup").Plugin[]} */
const Input_Es_Plugins = [exd(true)];

/**@type {import("rollup").Plugin[]} */
const Input_Raw_Es_Plugins = [];

/**@type {import("rollup").Plugin[]} */
const Input_Minify_Es_Plugins = [];

/**@type {import("rollup").Plugin[]} */
const Input_Raw_Cjs_Plugins = [];

/**@type {import("rollup").Plugin[]} */
const Input_Minify_Cjs_Plugins = [];

/**@type {string[]} */
const external = [
  //@ts-ignore
  ...Object.keys(pkg.dependencies || {}),
  //@ts-ignore
  ...Object.keys(pkg.devDependencies || {}),
];

/**
 *
 * @param {{
 *   minify?: boolean;
 *   sourcemap?: boolean;
 * }} options
 * @returns
 */
function createSWCOptions(options) {
  const minifyOptions = defineRollupSwcMinifyOption({
    compress: {
      unused: true,
      drop_console: true,
      drop_debugger: true,
      dead_code: true,
    },
    mangle: {
      keep_classnames: false,
      keep_fnames: false,
      keep_private_props: false,
    },
    ecma: 2020, // 5
  });
  return defineRollupSwcOption({
    jsc: {
      minify: options.minify ? minifyOptions : {},
      target: "es2022",
      parser: {
        syntax: "typescript",
        tsx: true,
        dynamicImport: false,
      },
      transform: {
        legacyDecorator: false,
        useDefineForClassFields: false,
      },
      keepClassNames: false,
    },
    minify: options.minify,
    sourceMaps: options.sourcemap ?? true,
    tsconfig: path.resolve(__dirname, "tsconfig.json"),
  });
}
/**
 *
 * @param {string} name
 * @returns
 */
function makeRollupConfig(name) {
  return defineConfig([
    {
      input: `./src/${name}.ts`,
      output: [
        {
          file: `./dist/esm/${name}.js`,
          format: "es",
          sourcemap: true,
          banner: basicBanner,
          exports: "named",
          plugins: [Output_RawPlugins, Output_Es_RawPlugins],
        },
      ],
      external,
      plugins: [GlobalInputPlugins, Input_Es_Plugins, Input_Raw_Es_Plugins],
    },
    {
      input: `./src/${name}.ts`,
      output: [
        {
          file: `./dist/esm/${name}.min.js`,
          format: "es",
          banner: minifyBanner,
          exports: "named",
          plugins: [Output_MinifyPlugins, Output_Es_MinifyPlugins],
        },
      ],
      external,
      plugins: [GlobalInputPlugins, Input_Es_Plugins, Input_Minify_Es_Plugins],
    },
    {
      input: `./src/${name}.ts`,
      output: [
        {
          file: `./dist/cjs/${name}.development.js`,
          format: "cjs",
          sourcemap: true,
          banner: basicBanner,
          exports: "named",
          plugins: [Output_RawPlugins, Output_Cjs_RawPlugins],
        },
      ],
      external,
      plugins: [GlobalInputPlugins, Input_Cjs_Plugins, Input_Raw_Cjs_Plugins],
    },
    {
      input: `./src/${name}.ts`,
      output: [
        {
          file: `./dist/cjs/${name}.production.min.js`,
          format: "cjs",
          banner: minifyBanner,
          exports: "named",
          plugins: [Output_MinifyPlugins, Output_Cjs_MinifyPlugins],
        },
      ],
      external,
      plugins: [
        GlobalInputPlugins,
        Input_Cjs_Plugins,
        Input_Minify_Cjs_Plugins,
      ],
    },
  ]);
}

export const entries = ["index", "router"];

const config = defineConfig([
  ...entries.flatMap((name) => makeRollupConfig(name)),
]);

/**
 * @param {any} _commandLineArgs
 * @returns {import("rollup").RollupOptions[]}
 */
export default (_commandLineArgs) => {
  for (const name of entries) {
    writeCjsEntryFile(name, "./dist", `${name}.cjs`);
    writeMjsEntryFile(name, "./dist", `${name}.mjs`);
  }
  writeCjsPackageJson(path.resolve(__dirname, "./dist/cjs"));
  return config;
};
