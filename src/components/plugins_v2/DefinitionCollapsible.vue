<template>
    <Collapsible
        :title="definition.title"
        :href="`def-${definition.key}`"
        class="def-collapsible"
        :class="`section-${section}`"
        arrow
        no-url-change
    >
        <template #content>
            <div class="def-content">
                <div v-for="(prop, propKey) in definition.properties" :key="propKey" class="def-property">
                    <div class="d-flex align-items-center justify-content-between gap-2">
                        <span>{{ propKey }}</span>
                        <PropertyBadges :property="prop" :show-dynamic="false" section-class="section-properties" />
                    </div>

                    <PropertyMeta :property="prop" :subtype="getSubtype(prop)" :enum-values="getEnumValues(prop)" />

                    <div v-if="prop.title !== undefined || prop.description !== undefined" class="property-desc mt-2">
                        <slot v-if="prop.title" :content="codeSanitizer(prop.title)" name="markdown" />
                        <slot v-if="prop.description" :content="codeSanitizer(prop.description)" name="markdown" />
                    </div>

                    <div v-if="depth < maxDepth && getDefs(prop).length" class="mt-3 nested-defs">
                        <DefinitionCollapsible
                            v-for="nested in getDefs(prop)"
                            :key="`${definition.key}-${nested.key}`"
                            :definition="nested"
                            :definitions="definitions"
                            :visited-keys="visitedKeysWithCurrent"
                            :depth="depth + 1"
                            :max-depth="maxDepth"
                        >
                            <template #markdown="{content}">
                                <slot :content="content" name="markdown" />
                            </template>
                        </DefinitionCollapsible>
                    </div>
                </div>
            </div>
        </template>
    </Collapsible>
</template>

<script setup lang="ts">
    import {computed} from "vue";
    import {
        extractEnumValues, 
        extractTypeInfo, 
        extractReferencedDefinitions, 
        type JSONProperty, 
        type JSONSchema
    } from "../../utils/schemaUtils.ts";
    import {sanitizeForMarkdown} from "../../utils/Utils";
    import Collapsible from "./CollapsibleV2.vue";
    import PropertyBadges from "./PropertyBadges.vue";
    import PropertyMeta from "./PropertyMeta.vue";

    const props = withDefaults(defineProps<{
        definition: {
            key: string,
            title: string,
            properties: Record<string, JSONProperty>
        },
        definitions?: Record<string, JSONSchema>,
        visitedKeys?: Set<string>,
        depth?: number,
        maxDepth?: number,
        section?: string
    }>(), {
        definitions: undefined,
        visitedKeys: () => new Set<string>(),
        depth: 0,
        maxDepth: 3,
        section: "properties"
    });

    defineSlots<{
        markdown: { content: string }
    }>();

    const codeSanitizer = sanitizeForMarkdown;

    const getSubtype = (p: JSONProperty) => {
        const subtype = extractTypeInfo(p).subType;
        return subtype && !subtype.startsWith("#") ? subtype : undefined;
    }

    const getEnumValues = (p: JSONProperty) => extractEnumValues(p);

    const getDefs = (p: JSONProperty) => {
        const defs = props.definitions;
        const d = props.depth;
        const max = props.maxDepth;
        const visited = props.visitedKeys;
        
        if (!defs || d >= max) return [];
        return extractReferencedDefinitions(p, defs, visited);
    }

    const visitedKeysWithCurrent = computed(() => {
        const newSet = new Set(props.visitedKeys);
        newSet.add(props.definition.key);
        return newSet;
    });
</script>

<style lang="scss" scoped>
    @use "../../scss/variables" as variables;
    @use "../../scss/color-palette" as color-palette;

    $section-colors: (
        properties: color-palette.$base-blue-300,
        outputs: color-palette.$base-green-300,
        metrics: color-palette.$base-orange-400
    );

    @each $section, $color in $section-colors {
        .section-#{$section} {
            .def-property span {
                color: $color;
            }
        }
    }

    .def-collapsible {
        margin-bottom: 0.875rem;

        :deep(.collapse-button span:not(.type-box)) {
            color: variables.$purple-37 !important;
            font-weight: 500 !important;
            font-size: 12px !important;
            font-family: "Source code pro", monospace;
            white-space: normal !important;
            overflow-wrap: anywhere !important;
            word-break: break-word !important;
            display: inline-block !important;
            max-width: 100%;
        }

        :deep(summary) {
            padding: 9px 1.875rem;
            font-size: 0.875rem;
            font-weight: 500;
            background: variables.$black-9;
            border: 1px solid variables.$black-6;
            border-radius: 12px 12px 0 0;
            transition: border-radius 150ms ease;
        }

        :deep(summary.collapsed) {
            border-radius: 12px;
        }

        .def-content {
            padding: 1rem 0;
            background: variables.$black-4;
            border: 1px solid variables.$black-6;
            border-top: none;
            border-radius: 0 0 12px 12px
        }

        .def-property {
            padding: 9px 2rem;
            border-bottom: 1px solid variables.$black-6;

            &:last-child {
                border-bottom: none;
                padding-bottom: 0;
            }

            &:first-child {
                padding-top: 0;
            }

            span {
                font-size: 12px !important;
                font-family: "Source code pro", monospace;
            }
        }

        .property-desc {
            font-size: 0.875rem;
            color: var(--ks-content-secondary) !important;
            line-height: 1.5;

            :deep(p) {
                margin: 0;
                font-size: 0.875rem !important;
                line-height: 22px;
                font-weight: normal;
            }

            :deep(code) {
                font-size: 0.8125rem;
            }
        }
    }

    .nested-defs {
        .def-collapsible {
            :deep(summary) {
                padding-left: 1.5rem;
            }
        }
    }
</style>
