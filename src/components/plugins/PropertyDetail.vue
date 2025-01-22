<template>
    <div class="property-detail">
        <div v-if="subtype">
            <span>
                SubType
            </span>
            <a v-if="subtype.startsWith('#')" :href="subtype" @click.stop>
                <button class="d-flex fw-bold type-box rounded fs-7 px-2 py-1">
                    <span class="ref-type">{{ className(subtype) }}</span><eye-outline />
                </button>
            </a>
            <span v-else class="type-box rounded fs-7 px-2 py-1">
                {{ subtype }}
            </span>
        </div>

        <div v-if="showDynamic">
            <span>
                Dynamic
            </span>
            <span class="border rounded px-2 py-1" :class="{'border-red': !isDynamic}">
                {{ isDynamic ? "YES" : "NO" }}
            </span>
        </div>

        <div v-if="property.default !== undefined">
            <span>
                Default
            </span>
            <span class="border rounded px-2 py-1">
                {{ property.default }}
            </span>
        </div>

        <div v-if="property.pattern !== undefined">
            <span>
                Validation RegExp
            </span>
            <span class="border rounded px-2 py-1">
                {{ property.pattern }}
            </span>
        </div>

        <div v-if="property.minLength !== undefined">
            <span>
                Min length
            </span>
            <span class="border rounded px-2 py-1">
                {{ property.minLength }}
            </span>
        </div>

        <div v-if="property.maxLength !== undefined">
            <span>
                Max length
            </span>
            <span class="border rounded px-2 py-1">
                {{ property.maxLength }}
            </span>
        </div>

        <div v-if="property.minItems !== undefined">
            <span>
                Min items
            </span>
            <span class="border rounded px-2 py-1">
                {{ property.minItems }}
            </span>
        </div>

        <div v-if="property.maxItems !== undefined">
            <span>
                Max items
            </span>
            <span class="border rounded px-2 py-1">
                {{ property.maxItems }}
            </span>
        </div>

        <div v-if="property.minimum !== undefined">
            <span>
                Minimum
            </span>
            <span class="border rounded px-2 py-1">
                &rsaquo;= {{ property.minimum }}
            </span>
        </div>

        <div v-if="property.exclusiveMinimum !== undefined">
            <span>
                Minimum
            </span>
            <span class="border rounded px-2 py-1">
                &rsaquo; {{ property.minimum }}
            </span>
        </div>

        <div v-if="property.maximum !== undefined">
            <span>
                Maximum
            </span>
            <span class="border rounded px-2 py-1">
                &lsaquo;= {{ property.maximum }}
            </span>
        </div>

        <div v-if="property.exclusiveMaximum !== undefined">
            <span>
                Maximum
            </span>
            <span class="border rounded px-2 py-1">
                &lsaquo; {{ property.maximum }}
            </span>
        </div>

        <div v-if="property.format !== undefined">
            <span>
                Format
            </span>
            <span class="border rounded px-2 py-1">
                {{ property.format }}
            </span>
        </div>

        <div v-if="property.enum !== undefined">
            <span>
                Possible Values
            </span>
            <div class="d-flex flex-wrap justify-content-end gap-7 p-0">
                <span v-for="(possibleValue, index) in property.enum" class="border rounded px-2 py-1" :key="index">
                    {{ possibleValue }}
                </span>
            </div>
        </div>

        <div v-if="property.title !== undefined || property.description !== undefined">
            <div class="property-description">
                <slot v-if="property.title !== undefined" :content="codeSanitizer(property.title)" name="markdown" />
                <slot v-if="property.description !== undefined" :content="codeSanitizer(property.description)" name="markdown" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import {className, extractTypeInfo, type JSONProperty} from "../../utils/schemaUtils.ts";
    import {ref} from "vue";
    import EyeOutline from "vue-material-design-icons/EyeOutline.vue";

    const props = withDefaults(
        defineProps<{
            property: JSONProperty,
            isDynamic: boolean
            showDynamic?: boolean
        }>(), {
            showDynamic: true
        }
    );

    const subtype = ref(extractTypeInfo(props.property).subType);

    const codeSanitizer = (str: string): string => {
        return str.replaceAll(/(```)(?:bash|yaml|js|console|json)(\n) *([\s\S]*?```)/g, "$1$2$3");
    }
</script>

<style lang="scss" scoped>
    @use "../../scss/color-palette" as color-palette;

    .property-detail > * {
        display: flex;
        justify-content: space-between;
        padding: 1rem 0;
        border-top: 1px solid var(--ks-border-primary);
        align-items: center;

        .border-red {
            border-color: color-palette.$base-red-400 !important;
        }

        &:last-child {
            padding-bottom: 0;
        }

        > * {
            width: fit-content;
        }
    }
</style>