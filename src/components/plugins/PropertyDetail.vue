<template>
    <div class="property-detail">
        <div v-if="subtype">
            <span>
                SubType
            </span>
            <a v-if="subtype.startsWith('#')" :href="subtype" @click.stop>
                <button class="d-flex fw-bold type-box rounded fs-7 px-2 py-1">
                    <span class="ref-type">{{ className(subtype) }}</span>
                    <EyeOutline />
                </button>
            </a>
            <span v-else class="type-box rounded fs-7 px-2 py-1">
                {{ subtype }}
            </span>
        </div>

        <div v-if="property.default !== undefined">
            <span>
                Default
            </span>
            <code class="border rounded px-2 py-1">
                {{ property.default }}
            </code>
        </div>

        <div v-if="property.pattern !== undefined">
            <span>
                Validation RegExp
            </span>
            <code class="border rounded px-2 py-1">
                {{ property.pattern }}
            </code>
        </div>

        <div v-if="property.unit !== undefined && property.unit.trim().length > 0">
            <span>
                Unit
            </span>
            <code class="border rounded px-2 py-1">
                {{ property.unit }}
            </code>
        </div>

        <div v-if="property.minLength !== undefined">
            <span>
                Min length
            </span>
            <code class="border rounded px-2 py-1">
                {{ property.minLength }}
            </code>
        </div>

        <div v-if="property.maxLength !== undefined">
            <span>
                Max length
            </span>
            <code class="border rounded px-2 py-1">
                {{ property.maxLength }}
            </code>
        </div>

        <div v-if="property.minItems !== undefined">
            <span>
                Min items
            </span>
            <code class="border rounded px-2 py-1">
                {{ property.minItems }}
            </code>
        </div>

        <div v-if="property.maxItems !== undefined">
            <span>
                Max items
            </span>
            <code class="border rounded px-2 py-1">
                {{ property.maxItems }}
            </code>
        </div>

        <div v-if="property.minimum !== undefined">
            <span>
                Minimum
            </span>
            <code class="border rounded px-2 py-1">
                &gt;= {{ property.minimum }}
            </code>
        </div>

        <div v-if="property.exclusiveMinimum !== undefined">
            <span>
                Minimum
            </span>
            <code class="border rounded px-2 py-1">
                &gt; {{ property.minimum }}
            </code>
        </div>

        <div v-if="property.maximum !== undefined">
            <span>
                Maximum
            </span>
            <code class="border rounded px-2 py-1">
                &lt;= {{ property.maximum }}
            </code>
        </div>

        <div v-if="property.exclusiveMaximum !== undefined">
            <span>
                Maximum
            </span>
            <code class="border rounded px-2 py-1">
                &lt; {{ property.maximum }}
            </code>
        </div>

        <div v-if="property.format !== undefined">
            <span>
                Format
            </span>
            <code class="border rounded px-2 py-1">
                {{ property.format }}
            </code>
        </div>

        <div v-if="enumValues !== undefined">
            <span>
                Possible Values
            </span>
            <div class="d-flex flex-wrap justify-content-end gap-7 p-0">
                <code v-for="(possibleValue, index) in enumValues" class="border rounded px-2 py-1" :key="index">
                    {{ possibleValue }}
                </code>
            </div>
        </div>

        <div v-if="property.title !== undefined || property.description !== undefined">
            <div class="property-description markdown">
                <slot v-if="property.title !== undefined" :content="codeSanitizer(property.title)" name="markdown" />
                <slot v-if="property.description !== undefined" :content="codeSanitizer(property.description)" name="markdown" />
                <div v-if="property['$internalStorageURI']">
                    <Alert type="info">
                        <slot content="Pebble expression referencing an Internal Storage URI e.g. `{{ outputs.mytask.uri }}`." name="markdown" />
                    </Alert>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import {className, extractEnumValues, extractTypeInfo, type JSONProperty} from "../../utils/schemaUtils.ts";
    import {ref} from "vue";
    import EyeOutline from "vue-material-design-icons/EyeOutline.vue";
    import Alert from "../content/Alert.vue";

    const props = defineProps<{
        property: JSONProperty
    }>();

    const subtype = ref(extractTypeInfo(props.property).subType);

    const enumValues = ref(extractEnumValues(props.property));

    const codeSanitizer = (str: string): string => {
        return str.replaceAll(/(```)(?:bash|yaml|js|console|json)(\n) *([\s\S]*?```)/g, "$1$2$3").replaceAll(/(?<!:):(?![: /])/g, ": ");
    }
</script>

<style lang="scss" scoped>
    @use "../../scss/color-palette" as color-palette;

    .property-detail > * {
        display: flex;
        justify-content: space-between;
        border-top: 1px solid var(--ks-border-primary);
        align-items: center;
        padding: 1rem 0;
        gap: var(--spacer);

        span, .property-description:deep(p) {
            line-height: 1.5rem;
            font-size: .875rem !important;
        }

        .property-description {
            color: var(--ks-content-secondary);
        }

        code {
            color: var(--ks-content-primary);
            background: var(--ks-background-body);
        }

        .border-red {
            border-color: color-palette.$base-red-400 !important;
        }

        &:first-child {
            padding-top: 0;
            border-top: none !important;
        }

        &:last-child {
            padding-bottom: 0;
        }

        > * {
            width: fit-content;
        }
    }
</style>
