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
                    :route-path="routePath"
                    class="text-capitalize"
                    @click="$emit('goTo', {subGroup: subGroupWrapper})"
                />
            </div>
        </template>
        <template v-else>
            <div class="d-flex flex-column elements-section" v-for="(elements, elementType) in groupedByAction" :key="elementType">
                <h4 :id="`section-${slugify(elementType)}`" class="text-capitalize">
                    {{ elementType }}
                </h4>
                <div class="d-flex flex-column">
                    <RowOptions
                        v-for="_,element of elements"
                        :id="slugify(element)"
                        :icon-b64-svg="'data:image/svg+xml;base64,' + (icons[elements[element][0]] ?? icons[plugin.subGroup ?? plugin.group] ?? icons[plugin.group])"
                        :text="elementName(element)"
                        :href="elementHref(element)"
                        :element="elements[element]"
                        :key="element"
                        :route-path="routePath"
                        class="text-capitalize"
                        @click="$emit('goTo', {element})"
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

    const elementName = (qualifiedName: string) => {
        let split = qualifiedName.split(".");
        return split?.[split.length - 1];
    }

    const subGroupHref = (targetSubGroup: string) => `${props.routePath}/${slugify(targetSubGroup)}`;

    const elementHref = (element: string) => `${props.routePath}/${element}`;

    function extractPluginElements(plugin: Plugin): Record<string, string[]> {
        return Object.fromEntries(
            Object.entries(plugin).filter(([key, value]) => isEntryAPluginElementPredicate(key, value))
                .map(([key, value]) => [key.replace(/[A-Z]/g, match => ` ${match}`), (value as PluginElement[]).filter(({deprecated}) => !deprecated).map(({cls}) => cls)])
        );
    }

    const groupedByAction = computed(() => {
        const result: any = {};
        console.log("elementByType---",elementsByType.value);
        
        //iterating over sections (tasks,triggers)
        for (let section in elementsByType.value ){
            console.log("section==",section)
            result[section] = {};

            const taskElements = elementsByType.value?.[section] ?? [];
            console.log("taskElem===",taskElements)

            for (let element of taskElements ){
                const parts = element.split(".");
                const subcategory = parts[4];
                const action = parts[5];

                if (!action || !subcategory) return;

                if (!result[section][subcategory]) {
                    result[section][subcategory] = [];
                }

                result[section][subcategory].push(element);
            }
        }

        console.log("result--",result)
        return result;
    });

    const elementsByType = computed<Record<string, string[]>>(() => extractPluginElements(plugin.value));

    defineEmits<{
        (e: "goTo", target: {subGroup?: Plugin & Pick<Plugin, "subGroup">, element?: string}): void
    }>()
</script>
