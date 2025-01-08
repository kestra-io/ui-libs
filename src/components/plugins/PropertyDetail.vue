<template>
    <div>
        <ul style="list-style-type: disc">
            <PropertyType :property="property" />

            <li v-if="showDynamic">
                <strong>Dynamic: </strong> {{ dynamicText(property) }}
            </li>

            <li>
                <strong>Required: </strong> {{ requiredText(property) }}
            </li>

            <li v-if="property.default !== undefined">
                <strong>Default: </strong>
                <code>{{ property.default }}</code>
            </li>

            <li v-if="property.pattern !== undefined">
                <strong>Validation RegExp: </strong>
                <code> {{ property.pattern }} </code>
            </li>

            <li v-if="property.minLength !== undefined">
                <strong>Min length: </strong>
                <code>{{ property.minLength }}</code>
            </li>

            <li v-if="property.maxLength !== undefined">
                <strong>Max length: </strong>
                <code>{{ property.maxLength }}</code>
            </li>

            <li v-if="property.minItems !== undefined">
                <strong>Min items: </strong>
                <code> {{ property.minItems }} </code>
            </li>

            <li v-if="property.maxItems !== undefined">
                <strong>Max items: </strong>
                <code> {{ property.maxItems }} </code>
            </li>

            <li v-if="property.minimum !== undefined">
                <strong>Minimum: </strong>
                <code>&rsaquo;= {{ property.minimum }} </code>
            </li>

            <li v-if="property.exclusiveMinimum !== undefined">
                <strong>Minimum: </strong>
                <code>&rsaquo; {{ property.minimum }} </code>
            </li>

            <li v-if="property.maximum !== undefined">
                <strong>Maximum: </strong>
                <code>&lsaquo;= {{ property.maximum }} </code>
            </li>

            <li v-if="property.exclusiveMaximum !== undefined">
                <strong>Maximum: </strong>
                <code>&lsaquo; {{ property.maximum }} </code>
            </li>

            <li v-if="property.format !== undefined">
                <strong>Format: </strong>
                <code> {{ property.format }} </code>
            </li>

            <li v-if="property.enum !== undefined">
                <strong>Possible Values:</strong>
                <ul>
                    <li v-for="(possibleValue, index) in property.enum" :key="index">
                        <code>{{ possibleValue }}</code>
                    </li>
                </ul>
            </li>
        </ul>

        <div v-if="property.title !== undefined || property.description !== undefined">
            <div class="fw-bold" v-if="property.title !== undefined">
                <slot :content="textSanitizer(property.title)" name="markdown" />
            </div>

            <blockquote v-if="property.description !== undefined" class="blockquote">
                <slot :content="textSanitizer(property.description)" name="markdown" />
            </blockquote>
        </div>
    </div>
</template>

<script setup>
    import PropertyType from "./PropertyType.vue";

    defineProps({
        property: {
            type: Object,
            required: true,
        },
        textSanitizer: {
            type: Function,
            required: false,
            default: (text) => text
        },
        showDynamic: {
            type: Boolean,
            required: false,
            default: true
        }
    });

    function dynamicText(property) {
        if (property["$dynamic"] === true) {
            return "✔️";
        }

        if (property["$dynamic"] === true) {
            return "❌";
        }

        if (property.oneOf?.some(prop => prop["$dynamic"] === true)) {
            return "✔️";
        }

        return "❌";
    }

    function requiredText(property) {
        if (property["$required"] === true) {
            return "✔️";
        }

        return property["$required"] === false ? "❌" : "❓";
    }
</script>