import {resolve} from "path"
import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
import {viteStaticCopy} from "vite-plugin-static-copy";
import * as sass from "sass";

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.js"),
            name: "KestraUI",
            fileName: "kestra-ui",
        },
        rollupOptions: {
            external: ["vue",
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
            },
            plugins: []
        },
    },
    plugins: [
        vue(),
        viteStaticCopy({
            targets: [
                {src: "src/scss/_variables.scss", dest: ""},
                {src: "src/scss/_theme-dark.scss", dest: ""},
            ],
        }),
    ],
    css: {
        preprocessorOptions: {
            scss: {
                logger: sass.Logger.silent
            },
        }
    }
})
