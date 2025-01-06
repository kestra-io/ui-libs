<template>
    <li>
        <strong>Type: </strong>
        <mark v-if="property.type" class="type-mark type-mark-default">
            {{ property.type }}
        </mark>
        <a
            aria-current="page"
            v-else-if="property['$ref']"
            :href="generateTaskHref(property['$ref'])"
            class="router-link-active router-link-exact-active"
        >
            <mark class="type-mark type-mark-default">
                {{ property['$ref']?.split('.').reverse()[0] }}
            </mark>
        </a>
        <ul v-else-if="property.oneOf">
            <li v-for="(oneOf, index) in property.oneOf" :key="index">
                <mark class="type-mark type-mark-default">{{ oneOf.type }}</mark>
            </li>
        </ul>
        <mark v-else class="type-mark type-mark-default">object</mark>
    </li>

    <li v-if="property.items ?? property.additionalProperties">
        <strong>SubType: </strong>
        <template v-if="property.items">
            <a
                aria-current="page"
                v-if="property.items['$ref']"
                :href="generateTaskHref(property.items['$ref'])"
                class="router-link-active router-link-exact-active"
            >
                <mark class="type-mark type-mark-default">
                    {{ property.items['$ref'].split('.').reverse()[0] }}
                </mark>
            </a>
            <mark v-else class="type-mark type-mark-default">{{ property.items.type }}</mark>
        </template>
        <template v-else-if="property.additionalProperties">
            <a
                aria-current="page"
                v-if="property.additionalProperties['$ref']"
                :href="generateTaskHref(property.additionalProperties['$ref'])"
                class="router-link-active router-link-exact-active"
            >
                <mark class="type-mark type-mark-default">
                    {{ property.additionalProperties['$ref'].split('.').reverse()[0] }}
                </mark>
            </a>
            <mark v-else class="type-mark type-mark-default">{{ property.additionalProperties.type }}</mark>
        </template>
    </li>
</template>

<script setup>
    defineProps({
        property: {
            type: Object,
            required: true,
        }
    });

    const generateTaskHref = (href) => {
        if (href) {
            const taskHref = href?.split("/");
            return `#${taskHref[taskHref?.length - 1]}`;
        }
    };
</script>