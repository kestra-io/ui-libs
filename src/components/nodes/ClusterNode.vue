<template>
    <span class="badge rounded-pill text-color" :class="[`bg-${data.color}`]">{{ id.replace("cluster_", "") }}</span>
    <div class="top-button-div text-white d-flex">
        <span
            v-if="data.collapsable"
            class="rounded-button"
            :class="[`bg-${data.color}`]"
            @click="collapse()"
            data-bs-toggle="tooltip"
            data-bs-trigger="hover"
            :title="$t('collapse')"
        >
            <ArrowCollapse class="button-icon" alt="Collapse task"/>
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
    import {Tooltip} from "bootstrap";

    export default {
        inheritAttrs: false,
        data() {
            return {
                tooltips: [],
            }
        },
        mounted() {
            const tooltipTriggerList = [].slice.call(document.querySelectorAll("[data-bs-toggle=\"tooltip\"]"));
            this.tooltips = tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new Tooltip(tooltipTriggerEl, {
                    placement: "top"
                })
            })
        },
        beforeUnmount() {
            document.querySelectorAll("[data-bs-toggle=\"tooltip\"]").forEach((el) => {
                const tooltip = Tooltip.getInstance(el);
                if (tooltip) {
                    tooltip.dispose();
                }
            });
        }
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

    .badge {
        top: -10px;
        position: relative;
        left: -3px;
    }

    .text-color {
        color: var(--bs-white);
        font-size: 0.5rem;
        font-weight: 700;
        padding: 0.25rem 0.5rem;
    }

    .top-button-div {
        transform: translate(-50%, -50%) !important;
        left: 100% !important;
        justify-content: center;
        padding-right: 3px;
    }

</style>
