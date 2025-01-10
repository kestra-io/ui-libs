<template>
    <div class="text-end mt-3 mb-3">
        <div class="btn btn-outline-primary">
            <ChevronRight />
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
import ChevronRight from "vue-material-design-icons/ChevronRight.vue"
</script>

<style lang="scss" scoped>
    div {
        .material-design-icon {
            color: var(--ks-content-link);
        }

        &:hover {
            :deep(a), :deep(a:hover) {
                color: var(--bs-white) !important;
            }
        }

        :deep(p) {
            display: inline;
            margin-bottom: 0 !important;
        }
    }


</style>