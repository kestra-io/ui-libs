<template>
    <div class="d-flex flex-column gap-6">
        <div>
            <div class="alert alert-info" role="alert" v-if="schema.properties?.$beta">
                <p>
                    This plugin is currently in beta. While it is considered safe for use, please be aware that its API
                    could change in ways that are not compatible with earlier versions in future releases, or it might
                    become unsupported.
                </p>
            </div>

            <div v-if="schema.properties?.title" class="plugin-title">
                <slot name="markdown" :content="schema.properties.title" />
            </div>
            <div v-if="schema.properties?.description">
                <slot name="markdown" :content="schema.properties.description" />
            </div>

            <SchemaToCode :highlighter="highlighter" language="yaml" :code="`type: &quot;${pluginType}&quot;`" />
        </div>

        <div class="d-flex flex-column gap-3">
            <Collapsible class="plugin-section" v-if="examples" clickable-text="Examples" href="examples">
                <template #content>
                    <div class="d-flex flex-column gap-4">
                        <template v-for="(example, index) in examples" :key="index">
                            <div class="d-flex flex-column gap-3">
                                <slot v-if="example.title" :content="example.title" name="markdown" />
                                <SchemaToCode
                                    :highlighter="highlighter"
                                    :language="example.lang ?? 'yaml'"
                                    :code="generateExampleCode(example)"
                                    v-if="example.code"
                                />
                            </div>
                            <hr class="w-75 align-self-center" v-if="index < examples.length - 1">
                        </template>
                    </div>
                </template>
            </Collapsible>

            <CollapsibleProperties
                v-if="schema.properties?.properties"
                class="plugin-section"
                :properties="schema.properties.properties"
                section-name="Properties"
                href="properties"
            >
                <template #markdown="{content}">
                    <slot name="markdown" :content="content" />
                </template>
            </CollapsibleProperties>

            <CollapsibleProperties
                v-if="Object.keys(schema.outputs?.properties ?? {}).length > 0"
                class="plugin-section"
                :properties="schema.outputs?.properties"
                section-name="Outputs"
                href="outputs"
                :show-dynamic="false"
            >
                <template #markdown="{content}">
                    <slot name="markdown" :content="content" />
                </template>
            </CollapsibleProperties>

            <Collapsible v-if="Object.keys(schema.definitions ?? {}).length > 0" class="plugin-section" clickable-text="Definitions" href="definitions" :initially-expanded="definitionsExpanded">
                <template #content>
                    <div class="d-flex flex-column gap-7 ps-3">
                        <CollapsibleProperties
                            v-for="[definitionKey, definitionValue] in Object.entries(schema.definitions)"
                            :properties="definitionValue.properties"
                            :section-name="definitionKey"
                            :href="definitionKey"
                            :show-dynamic="true"
                            :key="definitionKey"
                            class="plugin-section nested-button-py-2"
                            @expand="definitionsExpanded = true"
                        >
                            <template #markdown="{content}">
                                <slot name="markdown" :content="content" />
                            </template>
                        </CollapsibleProperties>
                    </div>
                </template>
            </Collapsible>
        </div>
    </div>
</template>

<script setup lang="ts">
    import {computed, onUnmounted, ref} from "vue";
    import type {HighlighterCore} from "shiki/core";
    import SchemaToCode from "./SchemaToCode.vue";
    import type {JSONProperty} from "./PropertyType.vue";
    import Collapsible from "../misc/Collapsible.vue";
    import CollapsibleProperties from "./CollapsibleProperties.vue";

    export interface JSONSchema {
        description?: string
        definitions?: Record<string, JSONSchema>
        outputs?: {
            properties: Record<string, JSONProperty>
        }
        properties?: Record<string, JSONProperty> & {
            title?: string
            description?: string
            length?: number
            properties?: Record<string, JSONProperty>
            $beta?: boolean
            $examples?: {
                title?: string
                code: string
                lang?: string
                full?: boolean
            }[]
        }
    }

    const props = defineProps<{
        schema: JSONSchema,
        pluginType: string
    }>();

    const definitionsExpanded = ref(false);

    const generateExampleCode = (example: NonNullable<NonNullable<JSONSchema["properties"]>["$examples"]>[number]) => {
        if (!example?.full) {
            const fullCode = `id: "${props.pluginType.split(".").reverse()[0]?.toLowerCase()}"\ntype: "${props.pluginType}"\n`;
            return fullCode.concat(example.code)
        }

        return example.code
    }

    const highlighter = ref<HighlighterCore | null>(null);

    const examples = computed(() => props.schema.properties?.["$examples"])

    const {
        githubDark,
        yaml,
        python,
        javascript,
        createJavaScriptRegexEngine,
        createHighlighterCore
    } = await import("./shikiToolset");

    highlighter.value = await createHighlighterCore({
        themes: [
            githubDark
        ],
        langs: [
            yaml,
            python,
            javascript
        ],
        engine: createJavaScriptRegexEngine(),
    });

    onUnmounted(() => highlighter.value.dispose());
</script>

<style scoped lang="scss">
    .plugin-title :deep(p) {
        font-size: 1rem;
    }

    :deep(.nested-button-py-2) button {
        padding-top: 0.5rem !important;
        padding-bottom: 0.5rem !important;
    }

    :deep(.plugin-section) {
        .material-design-icon {
            &, & * {
                height: 1.5rem;
                width: 1.5rem;
            }
        }

        .material-design-icon:not(.property .material-design-icon) {
            &, & * {
                height: 2rem;
                width: 2rem;
            }
        }
    }

    :deep(.type-box) {
        color: buttontext;

        & .material-design-icon{
            &, & * {
                height: 1rem;
                width: 1rem;
            }
        }
    }
</style>