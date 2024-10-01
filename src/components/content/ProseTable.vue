<template>
    <div class="container table-responsive">
        <table class="table">
            <slot />
        </table>
    </div>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
    @import "../../scss/variables";

    .table-responsive {
        padding: 0;
        margin: calc($spacer * 2) 0 calc($spacer * 4);
    }

    :deep(thead) {
        border-bottom: none !important;
        th {
            font-size: $font-size-md;
            font-weight: 600;
            line-height: 1.25rem;
            padding: calc($spacer * 0.5) $spacer $spacer;
            background-color: transparent;
            border-bottom: 4px solid var(--bs-border-color) !important;
            border-top: none;
            color: var(--bs-body-color);
        }
    }

    :deep(tbody) {
        tr {
            td {
                font-size: $font-size-sm;
                padding: calc($spacer * 1.5) $spacer $spacer !important;
                font-weight: 400;
                color: var(--bs-body-color);
            }
        }
    }
</style>