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
        value[0]?.cls !== undefined);
}

export function subGroupName(subGroupWrapper: Plugin) {
    const result = subGroupWrapper.title.replaceAll(/\.([a-zA-Z])/g, (_, capture) => ` ${capture.toUpperCase()}`);
    return result.charAt(0).toUpperCase() + result.slice(1);
}
