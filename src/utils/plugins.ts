export type PluginElement = {
    cls: string;
    deprecated?: boolean;
}

export type Plugin = {
    name: string;
    title: string;
    group: string;
    longDescription?: string;
    description?: string;
    subGroup?: string;
    tooltipContent?: string;
    categories?: string[];
    controllers?: string[];
    storages?: string[];
    aliases?: string[];
    guides?: string[];
    
} & {
    [pluginElement: string]: PluginElement[];
}

export function isEntryAPluginElementPredicate(key: string, value: any): value is PluginElement[] {
    return Array.isArray(value) &&
        !["categories", "controllers", "storages", "aliases", "guides"].includes(key) &&
        ((value as any[]).length === 0 ||
        value[0]?.cls !== undefined);
}

export function subGroupName(subGroupWrapper: Plugin) {
    const result = subGroupWrapper.title.replaceAll(/\.([a-zA-Z])/g, (_, capture) => ` ${capture.toUpperCase()}`);
    return result.charAt(0).toUpperCase() + result.slice(1);
}
