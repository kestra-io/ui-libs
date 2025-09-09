<template>
    <div class="d-flex flex-column gap-6">
        <div>
            <div class="alert alert-info mb-2" role="alert" v-if="schema.properties?.$beta">
                <p>
                    This plugin is currently in beta. While it is considered safe for use, please be aware that its API
                    could change in ways that are not compatible with earlier versions in future releases, or it might
                    become unsupported.
                </p>
            </div>

            <div v-if="schema.properties?.title" class="plugin-title markdown">
                <slot name="markdown" :content="schema.properties.title.replace(/ *:(?![ /])/g, ': ')" />
            </div>
            <div v-if="schema.properties?.description" class="markdown">
                <slot name="markdown" :content="schema.properties.description.replace(/ *:(?![ /])/g, ': ')" />
            </div>

            <SchemaToCode :highlighter="highlighter" language="yaml" :theme="codeTheme" :code="`type: &quot;${pluginType}&quot;`" :key="pluginType" />
        </div>

        <div class="d-flex flex-column gap-3" :key="pluginType">
            <Collapsible class="plugin-section" v-if="examples" clickable-text="Examples" href="examples" :no-url-change>
                <template #content>
                    <div class="d-flex flex-column gap-4">
                        <template v-for="(example, index) in examples" :key="pluginType + '-' + index">
                            <div class="d-flex flex-column gap-3">
                                <div class="markdown">
                                    <slot v-if="example.title" :content="example.title.replace(/ *:(?![ /])/g, ': ')" name="markdown" />
                                </div>
                                <SchemaToCode
                                    :highlighter="highlighter"
                                    :language="example.lang ?? 'yaml'"
                                    :theme="codeTheme"
                                    :code="generateExampleCode(example)"
                                    v-if="example.code"
                                />
                            </div>
                            <hr class="w-100 align-self-center" v-if="index < examples.length - 1">
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
                :initially-expanded="propsInitiallyExpanded"
                :force-include="forceIncludeProperties"
                :no-url-change
            >
                <template #markdown="{content}">
                    <div class="markdown">
                        <slot name="markdown" :content="content" />
                    </div>
                </template>
            </CollapsibleProperties>

            <CollapsibleProperties
                v-if="schema.outputs?.properties && Object.keys(schema.outputs.properties).length > 0"
                class="plugin-section"
                :properties="schema.outputs.properties"
                section-name="Outputs"
                href="outputs"
                :show-dynamic="false"
                :no-url-change
            >
                <template #markdown="{content}">
                    <div class="markdown">
                        <slot name="markdown" :content="content" />
                    </div>
                </template>
            </CollapsibleProperties>

            <CollapsibleProperties
                v-if="schema.properties?.$metrics"
                class="plugin-section"
                :properties="metrics"
                section-name="Metrics"
                href="metrics"
                :show-dynamic="false"
                :no-url-change
            >
                <template #markdown="{content}">
                    <div class="markdown">
                        <slot name="markdown" :content="content" />
                    </div>
                </template>
            </CollapsibleProperties>

            <Collapsible 
                v-if="schema.definitions && Object.keys(schema.definitions).length > 0" 
                class="plugin-section" 
                clickable-text="Definitions" 
                href="definitions" 
                :initially-expanded="definitionsExpanded"
                :key="`definitions-${pluginType}-${forceExpandKey}`"
                :no-url-change
            >
                <template #content>
                    <div class="d-flex flex-column gap-7 ps-3">
                        <CollapsibleProperties
                            v-for="[definitionKey, definitionValue] in Object.entries(schema.definitions)"
                            :properties="definitionValue.properties"
                            :section-name="definitionValue.title ?? definitionKey.split('_')[0]"
                            :href="definitionKey"
                            :show-dynamic="false"
                            :initially-expanded="expandedDefinitions.has(definitionKey)"
                            :key="pluginType + '-' + definitionKey"
                            class="plugin-section nested-button-py-2"
                            @expand="definitionsExpanded = true; expandedDefinitions.add(definitionKey)"
                            :no-url-change
                        >
                            <template #markdown="{content}">
                                <div class="markdown">
                                    <slot name="markdown" :content="content" />
                                </div>
                            </template>
                        </CollapsibleProperties>
                    </div>
                </template>
            </Collapsible>
        </div>
    </div>
</template>

<script setup lang="ts">
    import {computed, onMounted, onUnmounted, ref, watch, nextTick} from "vue";
    import type {HighlighterCore} from "shiki/core";
    import SchemaToCode from "./SchemaToCode.vue";
    import type {JSONProperty, JSONSchema} from "../../utils/schemaUtils.ts";
    import Collapsible from "../misc/Collapsible.vue";
    import CollapsibleProperties from "./CollapsibleProperties.vue";

    const props = withDefaults(defineProps<{
        schema: JSONSchema,
        pluginType: string,
        darkMode?: boolean,
        propsInitiallyExpanded?: boolean,
        forceIncludeProperties?: string[],
        noUrlChange?: boolean
    }>(), {
        darkMode: true,
        propsInitiallyExpanded: false,
        forceIncludeProperties: () => [],
        noUrlChange: false
    });

    const definitionsExpanded = ref(false);
    const expandedDefinitions = ref<Set<string>>(new Set());
    const forceExpandKey = ref(0);

    const checkHashAndExpand = async () => {
        const hash = window.location.hash.slice(1);
        if (!hash || !props.schema.definitions) {
            expandedDefinitions.value.clear();
            return;
        }

        const definitionKey = hash.includes("#") ? hash.split("#").pop()?.split(".").pop() : hash;

        if (definitionKey && definitionKey in props.schema.definitions) {
            definitionsExpanded.value = true;
            forceExpandKey.value += 1;
            expandedDefinitions.value.clear();
            expandedDefinitions.value.add(definitionKey);

            await nextTick();

            let attempts = 0;
            const maxAttempts = 30;

            const attemptScroll = () => {
                const element = document.getElementById(definitionKey);
                if (element) {
                    element.scrollIntoView({behavior: "smooth", block: "start"});
                } else if (attempts < maxAttempts) {
                    attempts++;
                    requestAnimationFrame(attemptScroll);
                }
            };
        
            requestAnimationFrame(attemptScroll);
        } else {
            expandedDefinitions.value.clear();
        }
    };

    watch([() => props.schema, () => props.pluginType], ([newSchema, newType], [oldSchema, oldType]) => {
        if (newSchema !== oldSchema || newType !== oldType) {
            if (props.schema.definitions) {
                checkHashAndExpand();
            }
        }
    });


    const generateExampleCode = (example: NonNullable<NonNullable<JSONSchema["properties"]>["$examples"]>[number]) => {
        if (!example?.full) {
            const fullCode = `id: "${props.pluginType.split(".").reverse()[0]?.toLowerCase()}"\ntype: "${props.pluginType}"\n`;
            return fullCode.concat(example.code)
        }

        return example.code
    }

    const highlighter = ref<HighlighterCore | null>(null);

    const examples = computed(() => props.schema.properties?.["$examples"]);

    const metrics = computed(() => Object.fromEntries(
        props.schema.properties?.["$metrics"]?.map(metric => ([metric.name, {...metric, name: undefined}])) as [string, JSONProperty][]
    ));

    const {
        githubLight,
        githubDark,
        yaml,
        python,
        javascript,
        createJavaScriptRegexEngine,
        createHighlighterCore
    } = await import("./shikiToolset");

    highlighter.value = await createHighlighterCore({
        themes: [
            props.darkMode ? githubDark : githubLight
        ],
        langs: [
            yaml,
            python,
            javascript
        ],
        engine: createJavaScriptRegexEngine(),
    });

    const codeTheme = "github-" + (props.darkMode ? "dark" : "light");

    onMounted(() => {
        checkHashAndExpand();
        window.addEventListener("hashchange", checkHashAndExpand);
    });

    onUnmounted(() => {
        window.removeEventListener("hashchange", checkHashAndExpand);
        highlighter.value?.dispose();
    });
</script>

<style scoped lang="scss">
    .plugin-title :deep(p) {
        font-size: 1rem;
    }

    :deep(.nested-button-py-2) button {
        padding-top: 0.5rem !important;
        padding-bottom: 0.5rem !important;
    }

    :deep(.markdown) {
        pre, .code-block {
            margin: 0;
        }

        > ol, > ul, > dl {
            margin-top: 0;
            margin-bottom: 0;
        }
    }

    :deep(.plugin-section) {
        .material-design-icon {
            &, & * {
                height: 1.5rem;
                width: 1.5rem;
                bottom: 0;
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

        & .material-design-icon {
            &, & * {
                height: 1rem;
                width: 1rem;
            }
        }
    }
</style>
