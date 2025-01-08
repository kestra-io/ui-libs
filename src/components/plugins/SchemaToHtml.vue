<template>
    <div>
        <div class="alert alert-info" role="alert" v-if="schema.properties?.$beta">
            <p>
                This plugin is currently in beta. While it is considered safe for use, please be aware that its API could change in ways that are not compatible with earlier versions in future releases, or it might become unsupported.
            </p>
        </div>

        <SchemaToCode :show-lang="showCodeLang" :copyable="copyableCode" :highlighter="highlighter" language="yaml" :code="`type: &quot;${pluginType}&quot;`" />
        <p v-if="schema.properties?.title">
            <span class="plugin-title" v-html="replaceText(schema.properties.title)" />
        </p>

        <slot v-if="schema.properties?.description" :content="schema.properties.description" name="markdown" />

        <template v-if="schema.properties?.['$examples']">
            <h2 id="examples">
                <a href="#examples">Examples</a>
            </h2>
            <template
                v-for="(example, index) in schema.properties['$examples']"
                :key="index"
            >
                <slot v-if="example.title" :content="example.title" name="markdown" />
                <SchemaToCode :show-lang="showCodeLang" :copyable="copyableCode" :highlighter="highlighter" :language="example.lang ?? 'yaml'" :code="generateExampleCode(example)" v-if="example.code" />
            </template>
        </template>

        <template v-if="schema.properties?.properties">
            <h2 id="properties">
                <a href="#properties">Properties</a>
            </h2>

            <template v-for="(property, propertyKey) in sortSchemaByRequired(schema.properties.properties)" :key="propertyKey">
                <h3 :id="propertyKey">
                    <a :href="`#${propertyKey}`">
                        <code>{{ propertyKey }}</code>
                    </a>
                </h3>
                <div
                    class="alert alert-info"
                    role="alert"
                    v-if="property['$beta']"
                >
                    <p>This property is currently in beta. While it is considered safe for use, please be aware that its API could change in ways that are not compatible with earlier versions in future releases, or it might become unsupported.</p>
                </div>
                <PropertyDetail :property="property" :text-sanitizer="replaceText">
                    <template #markdown="{content}">
                        <slot :content="content" name="markdown" />
                    </template>
                </PropertyDetail>
            </template>
        </template>

        <template v-if="schema.outputs?.properties">
            <h2 id="outputs">
                <a href="#outputs">Outputs</a>
            </h2>

            <template v-for="(output, outputKey) in sortSchemaByRequired(schema.outputs.properties)" :key="outputKey">
                <h3 :id="outputKey">
                    <a :href="`#${outputKey}`">
                        <code>{{ outputKey }}</code>
                    </a>
                </h3>
                <div
                    class="alert alert-warning"
                    role="alert"
                    v-if="output['$deprecated']"
                >
                    <p>⚠ Deprecated</p>
                </div>
                <div
                    class="alert alert-info"
                    role="alert"
                    v-if="output['$beta']"
                >
                    <p>This property is currently in beta. While it is considered safe for use, please be aware that its API could change in ways that are not compatible with earlier versions in future releases, or it might become unsupported.</p>
                </div>
                <PropertyDetail :show-dynamic="false" :property="output" :text-sanitizer="replaceText" />
            </template>
        </template>

        <template v-if="schema.definitions">
            <h2 id="definitions">
                <a href="#definitions">Definitions</a>
            </h2>

            <template v-for="(definition, definitionKey) in schema.definitions" :key="definitionKey">
                <h3 :id="definitionKey">
                    <a :href="`#${definitionKey}`">
                        <code>{{ definitionKey }}</code>
                    </a>
                </h3>
                <h4 :id="'properties-' + definitionKey" v-if="(definition.properties?.length ?? 0) > 0">
                    <a :href="`#properties-${definitionKey}`">
                        Properties
                    </a>
                </h4>
                <ul class="list-unstyled">
                    <li v-for="(property, propertyKey) in sortSchemaByRequired(definition.properties)" :key="propertyKey">
                        <h5 :id="definitionKey + '-' + propertyKey" v-if="definition.properties">
                            <code>
                                {{ propertyKey }}
                            </code>
                        </h5>
                        <PropertyDetail :property="property" :text-sanitizer="replaceText" />
                    </li>
                </ul>
            </template>
        </template>
    </div>
</template>

<script setup lang="ts">
    import SchemaToCode from "./SchemaToCode.vue";
    import {createHighlighterCore} from "shiki/core";
    import githubDark from "shiki/themes/github-dark.mjs";
    import yaml from "shiki/langs/yaml.mjs";
    import python from "shiki/langs/python.mjs";
    import javascript from "shiki/langs/javascript.mjs";
    import PropertyDetail from "./PropertyDetail.vue";
    import {createJavaScriptRegexEngine} from "shiki/engine/javascript";

    const props = defineProps<{
        schema: object,
        pluginType: string,
        showCodeLang: boolean,
        copyableCode: boolean
    }>();

    const replaceText = (str: string) => {
        str = str?.split("```")[0]?.replace(/`([^`]*)`/g, "<code>$1</code>");
        str = str?.replace(
            /\[(.*?)\]\((.*?)\)/g,
            (match, text, url) => {
                if (text && url ) {
                    return `<a href="${url}" rel="nofollow" target="_blank">${text}</a>`;
                } else {
                    return match;
                }
            }
        );
        return str?.split("```")[0];
    };

    const sortSchemaByRequired = (schema) => {
        const requiredKeys = [];
        const nonRequiredKeys = [];

        for (const key in schema) {
            if (schema[key].$required) {
                requiredKeys.push(key);
            } else {
                nonRequiredKeys.push(key);
            }
        }

        const sortedKeys = [...requiredKeys.sort(), ...nonRequiredKeys.sort()];

        const sortedSchema = {};
        sortedKeys.forEach(key => {
            sortedSchema[key] = schema[key];
        });

        return sortedSchema;
    }

    const generateExampleCode = (example) => {
        if (!example?.full) {
            const fullCode = `id: "${props.pluginType.split(".").reverse()[0]?.toLowerCase()}"\ntype: "${props.pluginType}"\n`;
            return fullCode.concat(example.code)
        }

        return example.code;
    }

    const highlighter = await createHighlighterCore({
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
</script>