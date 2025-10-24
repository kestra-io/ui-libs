<template>
    <div class="d-flex flex-column gap-4">
        <slot v-if="description !== undefined" name="markdown" :content="description.replace(/ *:(?![ /])/g, ': ')" />
        <!-- Root plugin page with subgroups -->

        <template v-if="subGroup === undefined && plugins.length > 1">
            <div class="d-flex flex-column">
                <RowOptions
                    v-for="subGroupWrapper in subGroupsWrappers"
                    :id="`group-${slugify(subGroupName(subGroupWrapper))}`"
                    :icon-b64-svg="'data:image/svg+xml;base64,' + (icons[subGroupWrapper.subGroup] ?? icons[subGroupWrapper.group])"
                    :text="subGroupName(subGroupWrapper)"
                    :href="subGroupHref(subGroupName(subGroupWrapper))"
                    :key="subGroupName(subGroupWrapper)"
                    :is-sub-wrapper="true"
                    :route-path="routePath"
                    class="text-capitalize"
                    @click.native="$emit('goTo', {subGroup: subGroupWrapper})"
                />
            </div>
        </template>
        <template v-else>
            <div class="d-flex flex-column elements-section" v-for="(subcategories, elementType) in groupedByAction" :key="elementType">
                <h4 :id="`section-${slugify(elementType)}`" class="text-capitalize">
                    {{ elementType }}
                </h4>
                <div class="d-flex flex-column">
                    <RowOptions
                        v-for="(elementList, subcategory) in subcategories"
                        :icon-b64-svg="'data:image/svg+xml;base64,' + (icons[elementList[0]] ?? icons[plugin.subGroup ?? plugin.group] ?? icons[plugin.group])"
                        :text="subcategory"
                        :element="elementList"
                        :is-sub-wrapper="false"
                        :key="subcategory"
                        :route-path="routePath"
                    />
                </div>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
    import RowOptions from "../misc/RowOptions.vue";
    import type {Plugin, PluginElement} from "../../utils/plugins";
    import {isEntryAPluginElementPredicate, subGroupName} from "../../utils/plugins";
    import {slugify} from "../../utils/url";
    import {computed} from "vue";

    const props = defineProps<{
        plugins: Plugin[],
        pluginName: string,
        routePath: string
        icons: Record<string, string>
        subGroup?: string | undefined,
    }>();

    const plugin = computed(() => props.plugins.find(p => props.subGroup === undefined ? true : (slugify(subGroupName(p)) === props.subGroup)) as Plugin);

    const description = computed(() => {
        return plugin.value?.longDescription ?? plugin.value?.description
    });

    const subGroupsWrappers = computed<Required<Plugin>[]>(() => {
        return props.plugins
            .filter(p => p.name.toLowerCase() === props.pluginName.toLowerCase() && p.subGroup !== undefined) as Required<Plugin>[];
    });

    const subGroupHref = (targetSubGroup: string) => `${props.routePath}/${slugify(targetSubGroup)}`;

    function extractPluginElements(plugin: Plugin): Record<string, string[]> {
        return Object.fromEntries(
            Object.entries(plugin).filter(([key, value]) => isEntryAPluginElementPredicate(key, value))
                .map(([key, value]) => [key.replace(/[A-Z]/g, match => ` ${match}`), (value as PluginElement[]).filter(({deprecated}) => !deprecated).map(({cls}) => cls)])
        );
    }

    const groupedByAction = computed(() => {
        const result: any = {};
        
        //iterating over sections (tasks,triggers)
        for (let section in elementsByType.value ){
            result[section] = {};

            const taskElements = elementsByType.value?.[section] ?? [];

            for (let element of taskElements ){
                const parts = element.split(".");
                const action = parts[parts.length - 1];
                
                if (!action) continue;

                // Determine subcategory: use second-to-last part if it exists and isn't the plugin name,
                // otherwise use the plugin name itself for root-level tasks
                let subcategory;
                if (parts.length > 1) {
                    const secondToLast = parts[parts.length - 2];
                    // Check if second-to-last is the main plugin package (e.g., "git" in io.kestra.plugin.git)
                    // If so, it's a root-level task
                    subcategory = secondToLast === props.pluginName.toLowerCase() ? props.pluginName : secondToLast;
                } else {
                    subcategory = props.pluginName;
                }

                if (!result[section][subcategory]) {
                    result[section][subcategory] = [];
                }

                result[section][subcategory].push(element);
            }
        }

        return result;
    });

    const elementsByType = computed<Record<string, string[]>>(() => extractPluginElements(plugin.value));

    defineEmits<{
        (e: "goTo", target: {subGroup?: Plugin & Pick<Plugin, "subGroup">, element?: string}): void
    }>()
</script>