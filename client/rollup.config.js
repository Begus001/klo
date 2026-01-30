import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import terser from "@rollup/plugin-terser";
import typescript from '@rollup/plugin-typescript';
import css from "rollup-plugin-import-css";
import svelte from "rollup-plugin-svelte";
import { execSync } from "child_process";
import fs from "fs-extra";
import { minify as minifyHtml } from "html-minifier-terser";

const GIT_TAG = execSync("git describe --tags").toString().trim();

class CopyOptions {
  /** @type {string} */
  input;
  /** @type {string} */
  output;
  /** @type {(content: string) => Promise<string>} */
  transform;
}

/** @param {CopyOptions} [options] */
function copy_with_transform(options) {
  let output;
  const transform = options.transform || ((input) => input);
  return {
    name: "copy-with-transform",
    buildStart() {
      this.addWatchFile(options.input);
      output = fs.readFile(options.input, "utf8").then(transform);
    },
    async generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: options.output,
        source: await output,
      });
    }
  }
}

export default [
  {
    input: "../messages.ts",
    output: {
      file: "../messages.js",
      format: "esm",
    },
    plugins: [
      typescript({
        compilerOptions: {
          rootDir: ".."
        }
      }),
      terser(),
    ],
  },
  {
    input: [
      "background.ts",
      "recon-websocket.ts",
      "internal-messages.ts"
    ],
    output: {
      dir: "dist",
      format: "esm",
      compact: true,
    },
    plugins: [
      resolve({
        browser: true,
      }),
      typescript(),
      copy_with_transform({ input: "manifest.json", output: "manifest.json", transform: async (input) => JSON.stringify(JSON.parse(input)) }),
      copy_with_transform({ input: "icon.svg", output: "icon.svg", transform: async (input) => minifyHtml(input) }),
      terser(),
    ],
  },
  {
    input: [
      "content.ts",
    ],
    output: {
      dir: "dist",
      format: "cjs",
      compact: true,
    },
    plugins: [
      resolve({
        browser: true,
      }),
      typescript(),
      terser(),
    ],
  },
  {
    input: "sidebar/sidebar.ts",
    output: {
      dir: "dist/sidebar",
      format: "esm",
    },
    plugins: [
      replace({ __GIT_TAG__: GIT_TAG, preventAssignment: true }),
      copy_with_transform({ input: "sidebar/sidebar.html", output: "sidebar.html", transform: async (input) => minifyHtml(input, { collapseWhitespace: true, removeComments: true }) }),
      copy_with_transform({ input: "sidebar/global.css", output: "global.css", transform: async (input) => minifyHtml(input, { collapseWhitespace: true, removeComments: true }) }),
      svelte({
        compilerOptions: {
          dev: false,
        },
        emitCss: false,
      }),
      resolve({
        browser: true,
        dedupe: ["svelte"],
        extensions: ['.svelte'],
      }),
      typescript(),
      css({
        output: "sidebar.css"
      }),
      terser(),
    ]
  },
  {
    input: "popup/popup.js",
    output: {
      dir: "dist/popup",
      format: "esm"
    },
    plugins: [
      copy_with_transform({ input: "popup/popup.html", output: "popup.html", transform: async (input) => minifyHtml(input, { collapseWhitespace: true, removeComments: true }) }),
      copy_with_transform({ input: "popup/popup.css", output: "popup.css" })
    ]
  }
]
