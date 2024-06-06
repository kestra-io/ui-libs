<template>
    <div class="bd-markdown">
        <div class="doc-alert alert alert-warning" role="alert" v-if="page.deprecated">
            <p>⚠ Deprecated</p>
        </div>

        <SchemaToCode language="yaml" :code='`type: "${getPageName()}"`'/>
        <p v-if="page.title">
            <span style="font-size:1.5em;" v-html="replaceText(page.title)"/>
        </p>
        <slot :content="page.description" name="markdown" />
        <h2 id="examples" v-if="page.body.children['examples']">
            <a href="#examples">Examples</a>
        </h2>
        <template v-for="example in page.body.children['examples']"
                  v-if="page.body.children['examples']">
            <slot :content="example.title" name="markdown" />
            <SchemaToCode :language="example.lang" :code="generateExampleCode(example)" v-if="example.code" />
        </template>
        <template v-for="(pageBlock, key) in page.body.children" v-if="page.body.children">
            <template v-if="key !== 'examples'">
                <h2 :id="key">
                    <a :href="`#${key}`">{{capitalizeFirstLetter(key)}}</a>
                </h2>
                <template v-for="(property, propertyKey) in sortSchemaByRequired(pageBlock)" v-if="key !== 'definitions'">
                    <h3 :id="property.name || propertyKey">
                        <a :href="`#${property.name || propertyKey}`">
                            <code>{{property.name || propertyKey}}</code>
                        </a>
                    </h3>
                    <div class="doc-alert alert alert-warning" role="alert"
                         v-if="property['$deprecated']">
                        <p>⚠ Deprecated</p>
                    </div>
                    <ul>
                        <li><strong>Type: </strong>
                            <mark class="type-mark type-mark-default"
                                  v-if="property.type || property['$ref']">
                                {{property.type || property['$ref']?.split('.').reverse()[0]}}
                            </mark>
                            <ul v-else-if="property.anyOf">
                                <li v-for="anyOf in property.anyOf">
                                    <mark class="type-mark type-mark-default">{{anyOf.type}}</mark>
                                </li>
                            </ul>
                        </li>
                        <li v-if="property.items">
                            <strong>SubType: </strong>
                            <a aria-current="page"
                               :href="generateTaskHref(property.items['$ref'])"
                               class="router-link-active router-link-exact-active">
                                <mark class="type-mark type-mark-default">
                                    {{property.items['$ref']?.split('.').reverse()[0] ||
                                    property.items.type ||'String'}}
                                </mark>
                            </a>
                        </li>
                        <li v-if="property['$dynamic'] !== undefined"><strong>Dynamic: </strong>{{
                            property['$dynamic'] === true ? "✔️" :
                            (property['$dynamic'] === false ? "❌" : "❓") }}
                        </li>
                        <li v-if="property['$required'] !== undefined"><strong>Required: </strong> {{
                            property['$required'] === true ? "✔️" :
                            (property['$required'] === false ? "❌" : "❓") }}
                        </li>
                        <li v-if="property.default !== undefined">
                            <strong>Default: </strong>
                            <code>{{property.default}}</code>
                        </li>
                        <li v-if="property.format">
                            <strong>Format: </strong>
                            <code> {{property.format}} </code>
                        </li>
                        <li v-if="property.minItems">
                            <strong>Min items: </strong>
                            <code> {{property.minItems}} </code>
                        </li>
                        <li v-if="property.minLength">
                            <strong>Min length: </strong>
                            <code>{{property.minLength}}</code>
                        </li>
                        <li v-if="property.enum">
                            <strong>Possible Values:</strong>
                            <ul>
                                <li v-for="possibleValue in property.enum">
                                    <code data-v-c4861ad0="" class="">{{possibleValue}}</code>
                                </li>
                            </ul>
                        </li>
                    </ul>

                    <slot :content="property.title" name="markdown" />
                    <blockquote class="blockquote">
                        <slot :content="property.description" name="markdown" />
                    </blockquote>
                </template>
                <template v-else>
                    <template v-for="(item, key) in pageBlock"
                              v-if="pageBlock">
                        <h3 :id="key">
                            <a :href="`#${key}`">
                                <code>{{key}}</code>
                            </a>
                        </h3>
                        <h4 id="properties-1"
                            v-if="item.properties">
                            <a href="#properties-1">Properties</a>
                        </h4>
                        <template
                          v-for="(definition, key) in item.properties"
                          v-if="item.properties">
                            <h5 :id="definition.name || key">
                                <a :href="`#${definition.name || key}`">
                                    <code>{{definition.name || key}}</code>
                                </a>
                            </h5>
                            <ul>
                                <li><strong>Type: </strong>
                                    <mark class="type-mark type-mark-default">
                                        {{definition.type ||
                                        definition['$ref']?.split('.').reverse()[0]}}
                                    </mark>
                                </li>
                                <li v-if="definition.items">
                                    <strong>SubType: </strong>
                                    <a aria-current="page"
                                       :href="generateTaskHref(definition.items['$ref'])"
                                       class="router-link-active router-link-exact-active">
                                        <mark class="type-mark type-mark-default">
                                            {{definition.items?.type || 'Task'}}
                                        </mark>
                                    </a>
                                </li>
                                <li v-if="definition['$dynamic'] !== undefined">
                                    <strong>Dynamic: </strong>
                                    {{definition['$dynamic'] === true ? "✔️" :
                                    (definition['$dynamic'] === false ? "❌" : "❓") }}
                                </li>
                                <li v-if="definition['$required'] !== undefined">
                                    <strong>Required: </strong>
                                    {{
                                    definition['$required'] === true ? "✔️" :
                                    (definition['$required'] === false ? "❌" : "❓") }}
                                </li>
                                <li v-if="definition.default !== undefined">
                                    <strong>Default: </strong>
                                    <code>{{definition.default}}</code>
                                </li>
                                <li v-if="definition.format">
                                    <strong>Format: </strong>
                                    <code>{{definition.format}}</code>
                                </li>
                                <li v-if="definition.minItems">
                                    <strong>Min items: </strong>
                                    <code>{{definition.minItems}}</code>
                                </li>
                            </ul>
                            <p>
                                <strong v-html="replaceText(definition.title)"/>
                            </p>
                            <blockquote class="blockquote">
                                <p v-html="replaceText(definition.description)"/>
                            </blockquote>
                        </template>
                    </template>
                </template>
            </template>
        </template>
    </div>
</template>

<script setup>
    import SchemaToCode from "./SchemaToCode.vue";

    const props = defineProps({
        page: {
            type: Object,
            required: true,
        },
        getPageName: {
            type: Function,
            required: true,
        }
    });


    function capitalizeFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    const replaceText = (str) => {
        str = str?.split("```")[0]?.replace(/`([^`]*)`/g, '<code>$1</code>');
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

    const generateTaskHref = (href) => {
        if (href) {
            const taskHref = href?.split('/');
            return `#${taskHref[taskHref?.length - 1].toLowerCase()}`;
        }
    };

    const generateDescHtml = computed(() => {
        const textBlocks = props.page?.description.split('\n\n');
        let content = '';
        textBlocks.forEach((text) => {
            const newText = replaceText(text);
            const descriptionParts = newText?.split(/:\s?\n/);

            if (descriptionParts) {
                const alertParts = descriptionParts[0].split(/::alert{type=\"warning\"}\n/);
                const alertContent =  (alertParts.length > 1)
                ?
                    `<div class="doc-alert alert alert-warning" role="alert">
                      <p>${replaceText(alertParts[1]?.split(':')[0])}</p>
                    </div>`
                :
                    `<p>${descriptionParts[0]}:</p>`;

                const listContent = descriptionParts[1]
                ?
                    `<ul>${generateList(descriptionParts[1])}</ul>`
                :
                    '';

                content += alertContent + listContent;
            } else {
                content += `<p>${newText}</p>`;
            }
        });

        return content;
    });

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

        const sortedKeys = [...requiredKeys, ...nonRequiredKeys];

        const sortedSchema = {};
        sortedKeys.forEach(key => {
            sortedSchema[key] = schema[key];
        });

        return sortedSchema;
    }

    const generateList = (descriptionPart) => {
        let optionList = '';
        descriptionPart?.split(/[-*]/).forEach((item) => {
            if (item.trim()) {
                optionList += `
                  <li>${replaceText(item)}</li>
                `
            }
        });

        return optionList;
    }

    const generateExampleCode = (example) => {
        if (!example?.full) {
            const firstCode = `id: "${props.getPageName()?.split('.').reverse()[0]?.toLowerCase()}"\ntype: "${props.getPageName()}"\n`;
            return firstCode.concat(example.code)
        }

        return example.code;
    }
</script>

<style lang="scss" scoped>
    :deep(.bd-markdown) {
        p {
            strong {
                code{
                    background: #161617;
                    border: 1px solid #252526;
                    border-radius: var(--bs-border-radius);
                    color: #b9b9ba;
                    padding: 0 .25rem;
                }
            }
        }
    }
</style>