<template>
    <span class="badge rounded-pill text-color" :class="[`bg-${data.color}`]">{{ id }}</span>
    <div class="position-absolute top-0 start-100 translate-middle text-white d-flex">
        <span
            v-if="data.collapsable"
            class="rounded-button"
            :class="[`bg-${data.color}`]"
            @click="collapse()"
        >
            <ArrowCollapse class="button-icon" alt="Collapse task" />
        </span>
    </div>
</template>
<script setup>
    import ArrowCollapse from "vue-material-design-icons/ArrowCollapse.vue"
    import {EVENTS} from "../../utils/constants.js";

    const props = defineProps(["data", "sourcePosition", "targetPosition", "label", "id"]);
    const emit = defineEmits([EVENTS.COLLAPSE])

    const collapse = () => {
        emit(EVENTS.COLLAPSE, props.id)
    };

</script>
<script>
    export default {
        inheritAttrs: false,
    }
</script>
<style scoped lang="scss">
    .rounded-button {
        border-radius: 1rem;
        width: 1rem;
        height: 1rem;
        display: flex;
        justify-content: center;
        align-items: center;
        pointer-events: auto !important;
    }

    .button-icon {
        font-size: 0.75rem;
    }

    .text-color {
        color: var(--bs-white);
        font-size: 0.625rem;
        font-weight: 700;
        padding: 0.25rem 0.5rem;
    }

</style>
