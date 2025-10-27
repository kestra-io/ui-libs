<template>
    <Collapsible class="section-collapsible" :clickable-text="sectionName" :href="href" @expand="emit('expand')" :initially-expanded="initiallyExpanded || autoExpanded" :no-url-change="noUrlChange">
        <template v-if="Object.keys(properties ?? {}).length > 0" #content>
            <div class="border overflow-hidden">
                <Collapsible
                    class="property"
                    v-for="(property, propertyKey) in sortedAndAggregated(properties)"
                    :key="propertyKey"
                    :arrow="false"
                    :clickable-text="propertyKey"
                    :href="href + '_' + propertyKey"
                    @expand="autoExpanded = true"
                    :no-url-change
                >
                    <template #additionalButtonText>
                        <Tooltip v-if="property['$required']" class="d-flex" title="Required">
                            <span class="text-danger"> *</span>
                        </Tooltip>
                    </template>
                    <template #buttonRight="{collapsed}">
                        <span class="d-flex flex-grow-1 align-items-center justify-content-between">
                            <span class="d-flex gap-2">
                                <Tooltip v-if="showDynamic && !isDynamic(property)" class="d-flex" title="Non-dynamic">
                                    <Snowflake class="text-info" />
                                </Tooltip>
                                <Tooltip v-if="property['$beta']" class="d-flex" title="Beta">
                                    <AlphaBBox class="text-warning" />
                                </Tooltip>
                                <Tooltip v-if="property['$deprecated']" class="d-flex" title="Deprecated">
                                    <Alert class="text-warning" />
                                </Tooltip>
                            </span>
                            <span class="d-flex flex-wrap justify-content-end gap-2">
                                <template v-for="type in extractTypeInfo(property).types" :key="type">
                                    <a v-if="type.startsWith('#')" class="d-flex fw-bold ref-type-box rounded fs-7 px-2 py-1" :href="type" @click.stop>
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
                        <PropertyDetail :property="property">
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
    import {
        extractTypeInfo,
        className,
        type JSONProperty,
        aggregateAllOf
    } from "../../utils/schemaUtils";
    import ChevronDown from "vue-material-design-icons/ChevronDown.vue";
    import Collapsible from "../misc/Collapsible.vue";
    import Tooltip from "../misc/Tooltip.vue";
    import PropertyDetail from "./PropertyDetail.vue";
    import ChevronUp from "vue-material-design-icons/ChevronUp.vue";
    import Alert from "vue-material-design-icons/Alert.vue";
    import Snowflake from "vue-material-design-icons/Snowflake.vue";
    import AlphaBBox from "vue-material-design-icons/AlphaBBox.vue";
    import EyeOutline from "vue-material-design-icons/EyeOutline.vue";
    import {ref, watch} from "vue";

    const props = withDefaults(defineProps<{ 
        href?: string, 
        sectionName: string, 
        properties?: Record<string, JSONProperty>, 
        showDynamic?: boolean, 
        initiallyExpanded?: boolean, 
        forceInclude?: string[],
        noUrlChange?: boolean
    }>(), {
        properties: undefined,
        href: Math.random().toString(36).substring(2, 5),
        showDynamic: true,
        initiallyExpanded: false,
        forceInclude: () => [] as string[],
        noUrlChange: false
    });

    const emit = defineEmits(["expand"]);

    const autoExpanded = ref(false);

    watch(
        autoExpanded,
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

        return property.anyOf?.some(prop => prop["$dynamic"] === true) ?? false;
    };

    function sortedAndAggregated(schema: Record<string, JSONProperty>): Record<string, JSONProperty> {
        const requiredKeys = [];
        const nonRequiredKeys = [];

        for (const key in schema) {
            if (typeof schema[key] === "object") {
                schema[key] = aggregateAllOf(schema[key]);
                if (schema[key].$required) {
                    requiredKeys.push(key);
                } else {
                    nonRequiredKeys.push(key);
                }
            }
        }

        const sortedKeys = [...requiredKeys.sort(), ...nonRequiredKeys.sort()];

        const sortedSchema = {} as Record<string, JSONProperty>;
        sortedKeys.forEach(key => {
            if (!schema[key].$deprecated || props.forceInclude?.includes(key)) {
                sortedSchema[key] = schema[key];
            }
        });

        return sortedSchema;
    }
</script>

<style lang="scss" scoped>
    @use "../../scss/variables" as variables;

    .type-box, :deep(.type-box) {
        background-color: var(--ks-tag-background-active) !important;
        color: var(--ks-tag-content) !important;
        font-size: 12px !important;
        line-height: 20px;
        padding: 0 8px;
        padding-bottom: 2px;
        border-radius: 8px !important;
        text-transform: capitalize;
    }
    .ref-type-box, :deep(.ref-type-box) {
        border: 1px solid variables.$blue !important;
        background: none;
        .ref-type {
            padding-right: 0.625rem;

            + * {
                margin-left: 0.625rem;
            }
        }
    }
    
    .border {
        border-radius: .5rem;
    }

    .property {
        gap: 0 !important;

        &:deep(> button) {
            font-size: 1rem !important;
            line-height: 1.5rem;
        }

        &:not(:first-child) {
            border-top: var(--bs-border-width) var(--bs-border-style) var(--collapsible-border-color);
        }

        :deep(> .collapse-button) {
            padding: .75rem 1rem;

            &:not(.collapsed) {
                border-bottom: var(--bs-border-width) var(--bs-border-style) var(--collapsible-border-color);
            }
        }

        :deep(> .collapsible-body:not(.collapsed)) {
            padding-top: .75rem;
            padding-bottom: .75rem;
        }

        :deep(.property-detail > *) {
            padding-left: 1rem;
            padding-right: 1rem;
        }
    }
</style>
