import {createMarkdownParser, createShikiHighlighter, rehypeHighlight,} from "@nuxtjs/mdc/runtime";
import GithubDark from "shiki/themes/github-dark.mjs";

export default function useMarkdownParser() {
    let parser;

    return async (markdown) => {
        if (!parser) {
            const {bundledLanguagesInfo} = await import("shiki/langs");

            const langsMap = {};
            const langs = [
                "bash",
                "c",
                "cpp",
                "csv",
                "dockerfile",
                "go",
                "groovy",
                "handlebars",
                "hcl",
                "ini",
                "java",
                "javascript",
                "json",
                "markdown",
                "mermaid",
                "perl",
                "php",
                "python",
                "r",
                "ruby",
                "rust",
                "scala",
                "sql",
                "systemd",
                "twig",
                "typescript",
                "xml",
                "yaml"
            ]
            langs.forEach(lang => {
                const info = bundledLanguagesInfo.find(i => i.aliases?.includes?.(lang) || i.id === lang);
                if (!info) {
                    throw new Error(`[@nuxtjs/mdc] Could not find shiki language: ${lang}`);
                }
                const langImport = () => import(`../../node_modules/shiki/dist/langs/${info.id}.mjs`);
                langsMap[info.id] = langImport;
                for (const alias of info.aliases || []) {
                    langsMap[alias] = langImport;
                }
            });

            parser = await createMarkdownParser({
                rehype: {
                    plugins: {
                        highlight: {
                            instance: rehypeHighlight,
                            options: {
                                // Pass in your desired theme(s)
                                theme: "github-dark",
                                // Create the Shiki highlighter
                                highlighter: createShikiHighlighter({
                                    bundledThemes: {
                                        "github-dark": GithubDark,
                                    },
                                    // Configure the bundled languages
                                    bundledLangs: langsMap,
                                }),
                            },
                        }
                    },
                },
            })
        }
        return parser(markdown)
    }
}