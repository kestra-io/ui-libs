import {getCurrentInstance} from "vue";
import humanizeDuration, {type Options as HumanizeDurationOptions,} from "humanize-duration";
import moment from "moment";
import momentTz from "moment-timezone";

const humanizeDurationLanguages = {
    en: {
        y: () => "y",
        mo: () => "mo",
        w: () => "w",
        d: () => "d",
        h: () => "h",
        m: () => "m",
        s: () => "s",
        ms: () => "ms",
    },
    fr: {
        y: () => "a",
        mo: () => "mo",
        w: () => "se",
        d: () => "j",
        h: () => "h",
        m: () => "m",
        s: () => "s",
        ms: () => "ms",
    },
};

export const DATE_FORMAT_STORAGE_KEY = "dateFormat";
export const TIMEZONE_STORAGE_KEY = "timezone";

export default {
    dateFilter: (dateString: string, format: string) => {
        const currentLocale = getCurrentInstance()?.appContext.config.globalProperties.$moment().locale();
        const momentInstance = getCurrentInstance()?.appContext.config.globalProperties.$moment(dateString).locale(currentLocale);
        let f;
        if (format === "iso") {
            f = "YYYY-MM-DD HH:mm:ss.SSS";
        } else {
            f = format ?? localStorage.getItem(DATE_FORMAT_STORAGE_KEY) ?? "llll";
        }
        // Apply timezone and format using the correct locale
        return momentInstance
            .tz(localStorage.getItem(TIMEZONE_STORAGE_KEY) ?? momentTz.tz.guess())
            .format(f);
    },
    splitFirst(str: string, separator: string) {
        return str.split(separator).slice(1).join(separator);
    },

    duration(isoString: string) {
        return (
            moment.duration(isoString, moment.ISO_8601 as any).asMilliseconds() / 1000
        );
    },
    humanDuration(
        value: number | string,
        options?: HumanizeDurationOptions & { languages?: any }
    ) {
        options = options || {maxDecimalPoints: 2};
        options.spacer = "";
        options.language = localStorage.getItem("lang") || "en";
        options.languages = humanizeDurationLanguages;
        options.largest = 2;

        if (typeof value !== "number") {
            value = this.duration(value);
        }

        return humanizeDuration(value * 1000, options).replace(
            /\.([0-9])s$/i,
            ".$10s"
        );
    },
    afterLastDot(str: string) {
        return str.split(".").pop();
    },
    distinctFilter(value: any, index: number, array: Array) {
        return array.indexOf(value) === index;
    }
};
