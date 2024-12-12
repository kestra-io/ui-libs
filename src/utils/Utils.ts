import humanizeDuration from "humanize-duration";
import moment from "moment";

const humanizeDurationLanguages = {
    "en" : {
        y: () => "y",
        mo: () => "mo",
        w: () => "w",
        d: () => "d",
        h: () => "h",
        m: () => "m",
        s: () => "s",
        ms: () => "ms",
    },
    "fr" : {
        y: () => "a",
        mo: () => "mo",
        w: () => "se",
        d: () => "j",
        h: () => "h",
        m: () => "m",
        s: () => "s",
        ms: () => "ms",
    }
}

export default class Utils {
    static splitFirst(str:string, separator:string) {
        return str.split(separator).slice(1).join(separator);
    }

    static duration(isoString:string) {
        return moment.duration(isoString, moment.ISO_8601 as any).asMilliseconds() / 1000
    }

    static humanDuration(value:string | number, options?: {
        maxDecimalPoints?: number,
        spacer?: string,
        language?: string,
        languages?: any,
        largest?: number
    }) {
        options = options || {maxDecimalPoints: 2};
        options.spacer = "";
        options.language = localStorage.getItem("lang") || "en";
        options.languages = humanizeDurationLanguages;
        options.largest = 2;

        if (typeof value !== "number") {
            value = Utils.duration(value);
        }

        return humanizeDuration(value * 1000, options).replace(/\.([0-9])s$/i, ".$10s")
    }

    static afterLastDot(str:string) {
        return str.split(".").pop();
    }

    static translate(text:string) {
        /* eslint-disable */
        if (typeof $t !== "undefined" && typeof $t === "function") {
            return $t(text);
        /* eslint-enable */
        } else {
            return text;
        }
    }
}