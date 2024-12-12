<template>
    <Suspense>
        <NuxtMDCRenderer v-bind="props" :prose="true" />
    </Suspense>
</template>
<script setup lang="ts">
    import NuxtMDCRenderer from "@nuxtjs/mdc/runtime/components/MDCRenderer.vue";

    type NuxtMDCRendererProps = InstanceType<typeof NuxtMDCRenderer>["$props"];

    const props = defineProps<NuxtMDCRendererProps>();
</script>