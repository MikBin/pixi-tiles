// in package.json scripts tag use & as alterantive to | or ; for sequential instead of parallel

import typescript from "rollup-plugin-typescript2";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";

export default {
    input: "src/TorusViewBundle.ts",
    output: {
        name: "TorusViewBundle",
        file: "TorusViewBundle.js",
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