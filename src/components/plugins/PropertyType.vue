<template>
    <div class="d-flex gap-1">
        <div class="border" v-if="property.type">
            {{ property.type }}
        </div>
        <a
            v-else-if="property['$ref']"
            :href="generateTaskHref(property['$ref'])"
            class="border"
        >
            {{ property['$ref']?.split('.').reverse()[0] }}
        </a>
        <div class="border" v-else-if="property.oneOf" v-for="(oneOf, index) in property.oneOf" :key="index">
            {{ oneOf.type }}
        </div>
        <div v-else class="border">
            object
        </div>
    </div><!--

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
    </li>-->
</template>

<script setup lang="ts">

    export interface JSONProperty {
        type:string;
        $dynamic?: boolean;
        $ref?:string;
        $required?:boolean;
        $beta?: boolean;
        $deprecated?: boolean;
        oneOf?:JSONProperty[];
        items?: JSONProperty;
        additionalProperties?:JSONProperty;
        title?:string;
        description?:string;
        default?:string;
        pattern?:string;
        minLength?:number;
        maxLength?:number;
        minItems?:number;
        maxItems?:number;
        minimum?:number;
        exclusiveMinimum?:number;
        maximum?:number;
        exclusiveMaximum?:number;
        format?:string;
        enum?: string[];
    }

    defineProps<{
        property:JSONProperty
    }>();

    const generateTaskHref = (href:string) => {
        if (href) {
            const taskHref = href?.split("/");
            return `#${taskHref[taskHref?.length - 1]}`;
        }
    };
</script>