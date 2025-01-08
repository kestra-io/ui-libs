declare global {
    interface String {
        capitalize(): string
        hashCode(): string
    }
}

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1)
}

String.prototype.hashCode = function () {
    let hash = 0;
    if (this.length === 0) {
        return "0";
    }
    for (let i = 0; i < this.length; i++) {
        const char = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash + "";
}

export const cssVariable = (name:string) => {
    const root = document.querySelector(":root");
    const rootStyle = root ? getComputedStyle(root) : null;

    return rootStyle?.getPropertyValue(name);
}
