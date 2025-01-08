<template>
    <Suspense>
        <NuxtMDCRenderer v-bind="$attrs as any" :prose="true" />
    </Suspense>
</template>

<script setup lang="ts">
    import NuxtMDCRenderer from "@nuxtjs/mdc/runtime/components/MDCRenderer.vue";
</script>