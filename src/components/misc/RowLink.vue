<template>
    <a :href="hrefWithDefault" class="row-link d-flex flex-grow-1 align-items-center gap-7 rounded">
        <img :src="iconB64Svg" :alt="`${text} icon`">{{ text }}
        <ChevronRight class="ms-auto" />
    </a>
</template>
<script setup lang="ts">
    import ChevronRight from "vue-material-design-icons/ChevronRight.vue";
    import {slugify} from "../../utils/url";
    import {useRoute} from "vue-router";
    import {computed} from "vue";

    const props = defineProps<{ iconB64Svg: string, text: string, href?: string | undefined }>();

    const {path} = useRoute();
    const hrefWithDefault = computed(() => props.href === undefined ? `${path}/${slugify(props.text)}` : props.href);
</script>
<style lang="scss" scoped>
    .row-link {
        border-width: 1px;
    }
</style>