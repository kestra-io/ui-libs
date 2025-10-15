import {createMarkdownParser, createShikiHighlighter, rehypeHighlight} from "@nuxtjs/mdc/runtime";
import {createJavaScriptRegexEngine} from "shiki/engine/javascript"
import type {MDCParserResult} from "@nuxtjs/mdc";
import GithubLight from "shiki/themes/github-light.mjs";
import GithubDark from "shiki/themes/github-dark.mjs";
import Bash from "shiki/langs/bash.mjs";
import C from "shiki/langs/c.mjs";
import Cpp from "shiki/langs/cpp.mjs";
import Csv from "shiki/langs/csv.mjs";
import Dockerfile from "shiki/langs/dockerfile.mjs";
import Go from "shiki/langs/go.mjs";
import Groovy from "shiki/langs/groovy.mjs";
import Handlebars from "shiki/langs/handlebars.mjs";
import Hcl from "shiki/langs/hcl.mjs";
import Ini from "shiki/langs/ini.mjs";
import Java from "shiki/langs/java.mjs";
import Javascript from "shiki/langs/javascript.mjs";
import Json from "shiki/langs/json.mjs";
import Markdown from "shiki/langs/markdown.mjs";
import Mermaid from "shiki/langs/mermaid.mjs";
import Perl from "shiki/langs/perl.mjs";
import Php from "shiki/langs/php.mjs";
import Python from "shiki/langs/python.mjs";
import R from "shiki/langs/r.mjs";
import Ruby from "shiki/langs/ruby.mjs";
import Rust from "shiki/langs/rust.mjs";
import Scala from "shiki/langs/scala.mjs";
import Sql from "shiki/langs/sql.mjs";
import Systemd from "shiki/langs/systemd.mjs";
import Twig from "shiki/langs/twig.mjs";
import Typescript from "shiki/langs/typescript.mjs";
import Xml from "shiki/langs/xml.mjs";
import Yaml from "shiki/langs/yaml.mjs";
import Html from "shiki/langs/html.mjs";


export const langsMap: Record<string, any> = {
    bash: Bash,
    c: C,
    cpp: Cpp,
    csv: Csv,
    dockerfile: Dockerfile,
    go: Go,
    groovy: Groovy,
    handlebars: Handlebars,
    hcl: Hcl,
    ini: Ini,
    java: Java,
    javascript: Javascript,
    json: Json,
    markdown: Markdown,
    mermaid: Mermaid,
    perl: Perl,
    php: Php,
    python: Python,
    r: R,
    ruby: Ruby,
    rust: Rust,
    scala: Scala,
    sql: Sql,
    systemd: Systemd,
    twig: Twig,
    typescript: Typescript,
    xml: Xml,
    yaml: Yaml,
    html: Html,
};

export type MDParser = (md: string) => Promise<MDCParserResult>

export default async function useMarkdownParser() {
    let parser: MDParser;

    return async (markdown:string) => {
        if (!parser) {
            
            const {bundledLanguagesInfo} = await import("shiki/langs");


            Object.entries(langsMap).forEach(([langId, lang]) => {
                const info = bundledLanguagesInfo.find(i => i.aliases?.includes?.(langId) || i.id === langId);
                if (!info) {
                    throw new Error(`[@nuxtjs/mdc] Could not find shiki language: ${langId}`);
                }
                for (const alias of info.aliases || []) {
                    langsMap[alias] = lang;
                }
            });

            parser = await createMarkdownParser({
                rehype: {
                    plugins: {
                        highlight: {
                            instance: rehypeHighlight,
                            options: {
                                theme: {
                                    dark: GithubDark,
                                    light: GithubLight
                                },
                                // Create the Shiki highlighter
                                highlighter: createShikiHighlighter({
                                    // Configure the bundled languages
                                    bundledLangs: langsMap,
                                    engine: createJavaScriptRegexEngine() as any
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