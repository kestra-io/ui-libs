<template>
    <a :href="hrefWithDefault" class="row-link d-flex flex-grow-1 align-items-center gap-7 rounded">
        <img :src="iconB64Svg" :alt="`${text} icon`">{{ text }}
        <ChevronRight class="ms-auto" />
    </a>
</template>
<script setup lang="ts">
    import ChevronRight from "vue-material-design-icons/ChevronRight.vue";
    import {slugify} from "../../utils/url";
    import {computed} from "vue";

    const props = defineProps<{ 
        iconB64Svg: string, 
        text: string, 
        routePath: string
        href?: string | undefined 
    }>();

    const hrefWithDefault = computed(() => props.href === undefined ? `${props.routePath}/${slugify(props.text)}` : props.href);
</script>
<style lang="scss" scoped>
    .row-link {
        border-width: 1px;
    }
</style>