export default class Utils {
    static splitFirst(str, separator) {
        return str.split(separator).slice(1).join(separator);
    }
}