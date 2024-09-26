<template>
    <div :class="'doc-alert alert alert-' + type" role="alert">
        <slot />
    </div>
</template>

<script>
    export default {
        components: {},
        props: {
            type: {
                type: String,
                required: true
            },
        },
    }
</script>

<style lang="scss" scoped>
    .doc-alert {
        --bs-alert-padding-x: var(--spacer);
        --bs-alert-padding-y: var(--spacer);
        --bs-alert-margin-bottom: var(--spacer);

        background-color: #18131f;
        border: 1px solid #3a3c55;
        padding: var(--bs-alert-padding-y) var(--bs-alert-padding-x);
        margin-bottom: var(--bs-alert-margin-bottom);

        > * {
            margin: 0;
        }
    }
</style>