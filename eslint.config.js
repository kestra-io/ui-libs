import globals from "globals";
import storybook from "eslint-plugin-storybook"
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import {includeIgnoreFile} from "@eslint/compat";
import path from "node:path";
import {fileURLToPath} from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, ".gitignore");

/** @type {import('eslint').Linter.Config[]} */
export default [
    includeIgnoreFile(gitignorePath),
    ...storybook.configs["flat/recommended"],
    {
        files: ["**/*.{js,mjs,cjs,ts,vue}"],
        ignores: ["node_modules", "node"],
    },
    {languageOptions: {globals: globals.browser}},
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
     {
        files: ["**/*.spec.js", "**/*.spec.ts", "vite.config.js", "vitest.config.js"],
        languageOptions: {globals: globals.node},
    },
    ...pluginVue.configs["flat/strongly-recommended"],
    {
        files: ["**/*.vue", "**/*.tsx", "**/*.jsx"],
        languageOptions: {parserOptions: {parser: tseslint.parser}},
        rules: {
            "vue/this-in-template": ["error"],
            "vue/html-indent": [
                "error",
                4,
                {
                    baseIndent: 1,
                },
            ],
            "vue/script-indent": [
                "error",
                4,
                {
                    baseIndent: 1,
                },
            ],
            "vue/max-attributes-per-line": [
                "error",
                {
                    singleline: 7,
                },
            ],
            "vue/multi-word-component-names": ["off"],
            "vue/no-deprecated-router-link-tag-prop": "off",
            "vue/object-curly-spacing": ["error", "never"],
            "vue/block-order": [
                "error",
                {
                    order: ["template", "script", "style"],
                },
            ],
        },
    },
    {
        rules: {
            quotes: ["error", "double"],
            "object-curly-spacing": ["error", "never"],
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    // args prefixed with '_' are ignored
                    argsIgnorePattern: "^_",
                },
            ],
            "@typescript-eslint/no-this-alias": "off",
            "@typescript-eslint/no-explicit-any": "off"
        }
    }
];
