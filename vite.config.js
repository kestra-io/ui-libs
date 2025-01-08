import * as path from "path"
import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import {viteStaticCopy} from "vite-plugin-static-copy";
import * as sass from "sass";

export default defineConfig({
    build: {
        sourcemap: true,
        lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            name: "KestraUI",
            fileName: "kestra-ui",
        },
        rollupOptions: {
            external: [
                "shiki",
                "vue",
                "humanize-duration",
                "moment",
                "lodash",
                "bootstrap",
                "@vue-flow/core",
                "@vue-flow/controls",
                "yaml",
                "vue-material-design-icons",
                "vite-plugin-static-copy",
                "vite",
                "sass",
                "@popperjs/core",
                "yaml",
                "js-yaml"
            ],
            output: {
                // Provide global variables to use in the UMD build
                // Add external deps here
                globals: {
                    vue: "Vue",
                },
            }
        },
    },
    plugins: [
        vue(),
        vueJsx(),
    ],
    css: {
        preprocessorOptions: {
            scss: {
                logger: sass.Logger.silent
            },
        }
    },
    resolve: {
        alias: {
            "#imports": path.resolve(__dirname, "./stub-mdc-imports.js"),
            "#build/mdc-image-component.mjs": path.resolve(__dirname, "./stub-mdc-imports.js"),
            "#mdc-imports": path.resolve(__dirname, "./stub-mdc-imports.js"),
            "#mdc-configs": path.resolve(__dirname, "./stub-mdc-imports.js"),
        }
    }
})
