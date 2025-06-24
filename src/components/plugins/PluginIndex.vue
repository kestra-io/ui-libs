<template>
    <div class="d-flex flex-column gap-4">
        <slot v-if="description !== undefined" name="markdown" :content="description.replaceAll(/ *:(?![ /])/g, ': ')" />
        <!-- Root plugin page with subgroups -->
        <template v-if="subGroup === undefined && plugins.length > 1">
            <div class="d-flex flex-column">
                <RowLink
                    v-for="subGroupWrapper in subGroupsWrappers"
                    :id="`group-${slugify(subGroupName(subGroupWrapper))}`"
                    :icon-b64-svg="'data:image/svg+xml;base64,' + icons[subGroupWrapper.subGroup]"
                    :text="subGroupName(subGroupWrapper)"
                    :href="subGroupHref(subGroupName(subGroupWrapper))"
                    :key="subGroupName(subGroupWrapper)"
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
                    <RowLink
                        v-for="element in Object.keys(elements)"
                        :id="slugify(element)"
                        :icon-b64-svg="'data:image/svg+xml;base64,' + icons[elements[element][0]]"
                        :text="elementName(element)"
                        :is-actions="elements[element]"
                        :key="element"
                        class="text-capitalize"
                        @click="$emit('goTo', {element})"
                    />
                </div>
            </div>
        </template>
    </div>
</template>
<script setup lang="ts">
    import RowLink from "../misc/RowLink.vue";
    import type {Plugin} from "../../utils/plugins";
    import {isEntryAPluginElementPredicate, subGroupName} from "../../utils/plugins";
    import {slugify} from "../../utils/url";
    import {computed} from "vue";
    import {useRoute} from "vue-router";

    const props = defineProps<{
        plugins: Plugin[],
        pluginName: string,
        subGroup?: string | undefined,
        icons: Record<string, string>
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

    const {path} = useRoute();

    const subGroupHref = (targetSubGroup: string) => `${path}/${slugify(targetSubGroup)}`;

    const elementHref = (element: string) => `${path}/${element}`;

    function extractPluginElements(plugin: Plugin): Record<string, string[]> {
        return Object.fromEntries(
            Object.entries(plugin).filter(([key, value]) => isEntryAPluginElementPredicate(key, value))
                .map(([key, value]) => [key.replaceAll(/[A-Z]/g, match => ` ${match}`), value as string[]])
        );
    }

    const elementsByType = computed<Record<string, string[]>>(() => extractPluginElements(plugin.value));
    const groupedByAction = computed(() => {
        const result: Record<string, object> = {};

        const allTasks = Object.keys(elementsByType.value);

        allTasks.forEach((task) => {
            result[task] = {};

            const taskElements = elementsByType.value?.[task] ?? [];

            taskElements.forEach((href) => {
                const parts = href.split(".");
                const subcategory = parts[4];
                const action = parts[5];

                if (!action || !subcategory) return;

                if (!result[task][action]) {
                    result[task][action] = [];
                }

                if (!result[task][action].includes(subcategory)) {
                    result[task][action].push(href);
                }
            });
        });

        return result;
    });

    defineEmits<{
        (e: "goTo", target: {subGroup?: Plugin & Pick<Plugin, "subGroup">, element?: string}): void
    }>()
</script>