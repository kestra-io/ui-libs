<template>
    <code>
        <slot />
    </code>
</template>


<style lang="scss" scoped>
    @import "../../scss/variables";

    code {
        color: $white-3;
        background: $black-2;
        border: 1px solid $black-3;
        border-radius: var(--bs-border-radius);
        padding: 0 0.25rem;
    }

</style>