<template>
    <div :class="'doc-alert alert alert-' + type" role="alert">
        <slot />
    </div>
</template>

<script setup lang="ts">
    defineProps<{
        type?: "info" | "warning" | "danger" | "success"
    }>();

    defineOptions({
        name: "Alert",
    });
</script>

<style lang="scss" scoped>
    .doc-alert {
        --bs-alert-padding-x: 1rem;
        --bs-alert-padding-y: 1rem;
        --bs-alert-margin-bottom: 1rem;

        background-color: #18131f;
        border: 1px solid #3a3c55;
        padding: var(--bs-alert-padding-y) var(--bs-alert-padding-x);
        margin-bottom: var(--bs-alert-margin-bottom);

        > * {
            margin: 0;
        }
    }
</style>