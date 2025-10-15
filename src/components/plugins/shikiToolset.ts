import {HighlighterCore, createHighlighterCore as shikiCreateHighlighterCore} from "shiki/core";
import {createJavaScriptRegexEngine} from "shiki/engine/javascript";
import githubLight from "shiki/themes/github-light.mjs";
import githubDark from "shiki/themes/github-dark.mjs";
import yaml from "shiki/langs/yaml.mjs";
import python from "shiki/langs/python.mjs";
import javascript from "shiki/langs/javascript.mjs";

let highlighterCoreCache: HighlighterCore | null = null;

export const getHighlighterCore = async () => {

    if (highlighterCoreCache) {
        return highlighterCoreCache;
    }
    const highlighterCore = await shikiCreateHighlighterCore({
        themes: [
            githubDark, githubLight
        ],
        langs: [
            yaml,
            python,
            javascript
        ],
        engine: createJavaScriptRegexEngine(),
    });
    highlighterCoreCache = highlighterCore;
    return highlighterCore;
}
