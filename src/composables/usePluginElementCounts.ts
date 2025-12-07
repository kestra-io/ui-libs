import {computed, unref, type Ref} from "vue";
import {extractPluginElements, type Plugin} from "../utils/plugins";

/**
 * Composable to compute plugin element counts and groupings.
 * Provides reactive computed values for elements by type and total count.
 * @param plugin - The plugin to analyze.
 * @returns Object with elementsByType (computed) and total (computed) counts.
 */
export function usePluginElementCounts(plugin: Plugin | Ref<Plugin>) {
    const elementsByType = computed(() => extractPluginElements(unref(plugin)));

    const total = computed(() => Object.values(elementsByType.value).reduce((sum, arr) => sum + arr.length, 0));

    return {elementsByType, total} as const;
}
