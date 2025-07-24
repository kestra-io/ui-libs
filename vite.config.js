import * as path from "path"
import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import * as sass from "sass";

export default defineConfig({
    build: {
        sourcemap: true,
        lib: {
            entry: [
                path.resolve(__dirname, "src/index.ts"), 
                path.resolve(__dirname, "src/utils/FlowYamlUtils.ts"),
                path.resolve(__dirname, "src/utils/VueFlowUtils.ts"),
            ],
            name: "KestraUI",
            fileName: (format, entryName) => `kestra-${entryName.toLowerCase()}.${format}.js`,
        },
        rollupOptions: {
            external: [
                "@nuxtjs/mdc/runtime",
                "shiki",
                "vue",
                "vue-router",
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
                "js-yaml",
                "moment-timezone"
            ],
            output: {
                // Provide global variables to use in the UMD build
                // Add external deps here
                globals: {
                    vue: "Vue",
                    "vue-router": "VueRouter",
                    "yaml": "PkgYaml",
                    "js-yaml": "JsYaml",
                    "humanize-duration": "HumanizeDuration",
                    "moment": "Moment",
                    "lodash": "Lodash",
                    "bootstrap": "Bootstrap",
                    "@vue-flow/core": "VueFlowCore",
                    "@vue-flow/controls": "VueFlowControls",
                    "@popperjs/core": "PopperCore",
                    "moment-timezone": "MomentTimezone",
                    "@nuxtjs/mdc/runtime": "NuxtMdcRuntime",
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
            "@storybook/addon-actions": "storybook/actions",
        }
    }
})
