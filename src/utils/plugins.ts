export type Plugin = {
    name: string;
    title: string;
    group: string;
    longDescription?: string;
    description?: string;
    subGroup?: string;
    categories?: string[];
    controllers?: string[];
    storages?: string[];
    aliases?: string[];
    guides?: string[];
} & {
    [pluginElement: string]: string[];
}

export function isEntryAPluginElementPredicate(key: string, value: any) {
    return Array.isArray(value) &&
        !["categories", "controllers", "storages", "aliases", "guides"].includes(key) &&
        ((value as any[]).length === 0 ||
        typeof value[0] === "string");
}

export function subGroupName(subGroupWrapper: Plugin) {
    return subGroupWrapper.title.replaceAll(/\.([a-zA-Z])/g, (_, capture) => ` ${capture.toUpperCase()}`).capitalize();
}