import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import typescript from '@rollup/plugin-typescript';
import commonjs from "@rollup/plugin-commonjs";

export default [
  {
    input: ["background.ts", "content-script.ts", "recon-websocket.ts"],
    output: {
      dir: ".",
      format: "esm"
    },
    plugins: [
      resolve({
        browser: true,
      }),
      typescript(),
    ]

  },
  {
    input: "sidebar/main.ts",
    output: {
      file: "sidebar/sidebar.js",
      format: "esm",
    },
    plugins: [
      svelte({
        compilerOptions: {
          dev: false,
        }
      }),
      resolve({
        browser: true,
        dedupe: ["svelte"],
      }),
      typescript(),
      commonjs({
      }),
    ]
  }
]
