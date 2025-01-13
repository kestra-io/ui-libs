import type {MDParser} from "./useMarkdownParser"
import {loadWasm} from "shiki/engine/oniguruma"

let parser:MDParser

export default async function getMDCParser() {
    if(parser){
        return parser
    }
    
    const mdParserExport = await import("./useMarkdownParser")

    const useMarkdownParser = mdParserExport.default ?? mdParserExport
    
    // import wasm as assets
    await loadWasm(import("shiki/wasm"))
    parser = await useMarkdownParser();
    return parser
}