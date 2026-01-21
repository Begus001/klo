import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import typescript from '@rollup/plugin-typescript';
import fs from "fs-extra";

export default [
  {
    input: ["background.ts", "content.ts", "recon-websocket.ts", "internal-messages.ts"],
    output: {
      dir: "dist",
      format: "esm",
    },
    plugins: [
      resolve({
        browser: true,
      }),
      typescript(),
      {
        name: "copy files",
        buildEnd() {
          fs.copy("manifest.json", "dist/manifest.json");
        }
      },
    ],
  },
  {
    input: "sidebar/sidebar.ts",
    output: {
      dir: "dist/sidebar",
      format: "esm"
    },
    plugins: [
      {
        name: "copy files",
        buildEnd() {
          fs.copy("sidebar/sidebar.html", "dist/sidebar/sidebar.html");
          fs.copy("sidebar/global.css", "dist/sidebar/global.css");
        }
      },
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
    ]
  },
]
