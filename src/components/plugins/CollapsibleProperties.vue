<template>
    <Collapsible :clickable-text="sectionName" :href="href" @expand="emit('expand')" :initially-expanded="initiallyExpanded">
        <template v-if="Object.keys(properties ?? {}).length > 0" #content>
            <div class="border rounded">
                <Collapsible
                    class="property p-3"
                    v-for="(property, propertyKey) in sortSchemaByRequired(properties)"
                    :key="propertyKey"
                    :arrow="false"
                    :clickable-text="propertyKey"
                    :href="href + '_' + propertyKey"
                    @expand="initiallyExpanded = true"
                >
                    <template #additionalButtonText>
                        <Tooltip v-if="property['$required']" class="d-flex" title="Required">
                            <span class="text-danger"> *</span>
                        </Tooltip>
                    </template>
                    <template #buttonRight="{collapsed}">
                        <span class="d-flex flex-grow-1 align-items-center justify-content-between">
                            <span class="d-flex gap-1">
                                <Tooltip v-if="showDynamic && !isDynamic(property)" class="d-flex" title="Non-dynamic">
                                    <Cancel class="text-danger" />
                                </Tooltip>
                                <Tooltip v-if="property['$beta']" class="d-flex" title="Beta">
                                    <AlphaBBox class="text-warning" />
                                </Tooltip>
                                <Tooltip v-if="property['$deprecated']" class="d-flex" title="Deprecated">
                                    <Alert class="text-warning" />
                                </Tooltip>
                            </span>
                            <span class="d-flex gap-2">
                                <template v-for="type in extractTypeInfo(property).types" :key="type">
                                    <a v-if="type.startsWith('#')" class="d-flex fw-bold type-box rounded fs-7 px-2 py-1" :href="type" @click.stop>
                                        <span class="ref-type">{{ className(type) }}</span><eye-outline />
                                    </a>
                                    <span v-else class="type-box rounded fs-7 px-2 py-1">
                                        {{ type }}
                                    </span>
                                </template>
                                <component :is="collapsed ? ChevronDown : ChevronUp" class="arrow" />
                            </span>
                        </span>
                    </template>
                    <template #content>
                        <PropertyDetail :show-dynamic="showDynamic" :is-dynamic="showDynamic && isDynamic(property)" :property="property">
                            <template #markdown="{content}">
                                <slot :content="content" name="markdown" />
                            </template>
                        </PropertyDetail>
                    </template>
                </Collapsible>
            </div>
        </template>
    </Collapsible>
</template>

<script setup lang="ts">
    import {extractTypeInfo, className, type JSONProperty} from "../../utils/schemaUtils";
    import ChevronDown from "vue-material-design-icons/ChevronDown.vue";
    import Collapsible from "../misc/Collapsible.vue";
    import Tooltip from "../misc/Tooltip.vue";
    import PropertyDetail from "./PropertyDetail.vue";
    import ChevronUp from "vue-material-design-icons/ChevronUp.vue";
    import Alert from "vue-material-design-icons/Alert.vue";
    import Cancel from "vue-material-design-icons/Cancel.vue";
    import AlphaBBox from "vue-material-design-icons/AlphaBBox.vue";
    import type {JSONSchema} from "./SchemaToHtml.vue";
    import EyeOutline from "vue-material-design-icons/EyeOutline.vue";
    import {ref, watch} from "vue";

    withDefaults(defineProps<{ href?: string, sectionName: string, properties?: Record<string, JSONProperty>, showDynamic?: boolean }>(), {
        properties: undefined,
        href: Math.random().toString(36).substring(2, 5),
        showDynamic: true
    });

    const emit = defineEmits(["expand"]);

    const initiallyExpanded = ref(false);

    watch(
        initiallyExpanded,
        newInitiallyExpanded => {
            if (newInitiallyExpanded) {
                emit("expand");
            }
        }
    );

    const isDynamic = (property: JSONProperty): boolean => {
        if (property["$dynamic"] === true) {
            return true;
        }

        if (property["$dynamic"] === false) {
            return false;
        }

        return property.oneOf?.some(prop => prop["$dynamic"] === true) ?? false;
    };

    function sortSchemaByRequired<T extends NonNullable<NonNullable<JSONSchema["properties"]>["properties"]>>(schema: T): T {
        const requiredKeys = [];
        const nonRequiredKeys = [];

        for (const key in schema) {
            if (typeof schema[key] === "object") {
                if (schema[key].$required) {
                    requiredKeys.push(key);
                } else {
                    nonRequiredKeys.push(key);
                }
            }
        }

        const sortedKeys = [...requiredKeys.sort(), ...nonRequiredKeys.sort()];

        const sortedSchema: T = {} as T;
        sortedKeys.forEach(key => {
            sortedSchema[key] = schema[key];
        });

        return sortedSchema;
    }
</script>

<style lang="scss" scoped>
    @use "../../scss/variables" as variables;

    .type-box, :deep(.type-box) {
        border: 1px solid variables.$blue !important;
        background: none;

        .ref-type {
            padding-right: 0.625rem;

            + * {
                margin-left: 0.625rem;
            }
        }
    }

    .property:not(:first-child) {
        border-top: var(--bs-border-width) var(--bs-border-style) var(--bs-border-color);
    }
</style>