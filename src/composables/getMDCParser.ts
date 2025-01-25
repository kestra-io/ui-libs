import type {MDParser} from "./useMarkdownParser"


let parser:MDParser

export default async function getMDCParser() {
    if(parser){
        return parser
    }
    
    const mdParserExport = await import("./useMarkdownParser")

    const useMarkdownParser = mdParserExport.default ?? mdParserExport
    
    parser = await useMarkdownParser();
    return parser
}