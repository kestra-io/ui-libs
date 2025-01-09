import type {MDParser} from "./useMarkdownParser"
import {loadWasm} from "shiki/engine/oniguruma"

let parser:MDParser

export default async function getMDCParser() {
    if(parser){
        return parser
    }
    
    const {default: useMarkdownParser} = await import("./useMarkdownParser")
    
    // import wasm as assets
    await loadWasm(import("shiki/wasm"))
    parser = await useMarkdownParser();
    return parser
}