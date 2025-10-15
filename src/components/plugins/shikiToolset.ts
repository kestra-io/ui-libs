import {createHighlighterCore as shikiCreateHighlighterCore} from "shiki/core";
import {createJavaScriptRegexEngine} from "shiki/engine/javascript";
import githubLight from "shiki/themes/github-light.mjs";
import githubDark from "shiki/themes/github-dark.mjs";
import yaml from "shiki/langs/yaml.mjs";
import python from "shiki/langs/python.mjs";
import javascript from "shiki/langs/javascript.mjs";

const highlighterCoreCache = new Map<"dark" | "light", Awaited<ReturnType<typeof shikiCreateHighlighterCore>>>();

export const createHighlighterCore = async (darkMode: boolean) => {
    const cacheKey = darkMode ? "dark" : "light";
    if (highlighterCoreCache.has(cacheKey)) {
        return highlighterCoreCache.get(cacheKey);
    }
    const highlighterCore = await shikiCreateHighlighterCore({
        themes: [
            darkMode ? githubDark : githubLight
        ],
        langs: [
            yaml,
            python,
            javascript
        ],
        engine: createJavaScriptRegexEngine(),
    });
    highlighterCoreCache.set(cacheKey, highlighterCore);
    return highlighterCore;
}
