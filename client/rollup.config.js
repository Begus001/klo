import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import typescript from '@rollup/plugin-typescript';
import css from "rollup-plugin-import-css";
import fs from "fs-extra";
import { minify as minifyHtml } from "html-minifier-terser";
import terser from "@rollup/plugin-terser";
import { execSync } from "child_process";
import replace from "@rollup/plugin-replace";

const GIT_TAG = execSync("git describe --tags").toString().trim();

class CopyOptions {
  /** @type {string} */
  input;
  /** @type {string} */
  output;
  /** @type {(content: string) => string} */
  transform;
}

/** @param {CopyOptions} [options] */
function copy_with_transform(options) {
  return {
    name: "copy-with-transform",
    async buildEnd() {
      let input = fs.readFileSync(options.input, "utf8");
      let output = await options.transform(input);
      this.emitFile({
        type: "prebuilt-chunk",
        fileName: options.output,
        code: output,
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
      copy_with_transform({ input: "manifest.json", output: "manifest.json", transform: (input) => JSON.stringify(JSON.parse(input)) }),
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
      copy_with_transform({ input: "manifest.json", output: "manifest.json", transform: (input) => JSON.stringify(JSON.parse(input)) }),
      terser(),
    ],
  },
  {
    input: "sidebar/sidebar.ts",
    output: {
      dir: "dist/sidebar",
      format: "esm",
      compact: true,
    },
    plugins: [
      replace({ __GIT_TAG__: GIT_TAG }),
      copy_with_transform({ input: "sidebar/sidebar.html", output: "sidebar.html", transform: (input) => minifyHtml(input, { collapseWhitespace: true, removeComments: true }) }),
      copy_with_transform({ input: "sidebar/global.css", output: "global.css", transform: (input) => minifyHtml(input, { collapseWhitespace: true, removeComments: true }) }),
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
]
