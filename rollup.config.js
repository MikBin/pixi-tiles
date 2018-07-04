import typescript from "rollup-plugin-typescript2";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";

export default {
    input: "src/index.ts",
    output: {
        file: "main.es6.js",
        format: "iife"
    },
    sourcemap: true,
    plugins: [
        typescript(),
        resolve({
            jsnext: true
        }),
        commonjs()
    ],
    globals: {
        "pixi.js": "PIXI",
        "pixi-filters": "PIXI.filters"
    },
    external: [
        "pixi.js",
        "pixi-filters"
    ]
};