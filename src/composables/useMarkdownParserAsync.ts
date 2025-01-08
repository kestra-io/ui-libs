import type {MDParser} from "./useMarkdownParser"

let parser:MDParser

export default async function useMarkdownParserAsync() {
    if(parser){
        return parser
    }
    
    const {default: useMarkdownParser} = await import("./useMarkdownParser")
    parser = await useMarkdownParser();
    return parser
}