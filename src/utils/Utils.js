import humanizeDuration from "humanize-duration";

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
    static splitFirst(str, separator) {
        return str.split(separator).slice(1).join(separator);
    }

    static duration(isoString) {
        return moment.duration(isoString, moment.ISO_8601).asMilliseconds() / 1000
    }

    static humanDuration(value, options) {
        options = options || {maxDecimalPoints: 2};
        options.spacer = "";
        options.language = localStorage.getItem("lang") || "en";
        options.languages = humanizeDurationLanguages;
        options.largest = 2;

        if (typeof (value) !== "number") {
            value = Utils.duration(value);
        }

        return humanizeDuration(value * 1000, options).replace(/\.([0-9])s$/i, ".$10s")
    }
}