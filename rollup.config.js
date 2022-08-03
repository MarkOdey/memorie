// rollup.config.js
import { nodeResolve } from "@rollup/plugin-node-resolve";
import postcss from "rollup-plugin-postcss";
import commonjs from "@rollup/plugin-commonjs";
import monaco from "rollup-plugin-monaco-editor";

export default {
  output: {
    format: "es",
    dir: "dist",
  },
  // ...other config
  plugins: [
    // ...other plugins
    // handle .css files
    postcss(),
    monaco({
      languages: ["javascript"],
    }),
    nodeResolve(),
    commonjs(),
  ],
};
