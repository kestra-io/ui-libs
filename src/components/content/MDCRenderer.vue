<template>
    <Suspense>
        <NuxtMDCRenderer v-bind="$attrs" :prose="true" />
    </Suspense>
</template>
<script setup lang="ts">
    import NuxtMDCRenderer from "@nuxtjs/mdc/runtime/components/MDCRenderer.vue";
</script>