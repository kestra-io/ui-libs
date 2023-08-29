<script>
    import {computed} from "vue";
    import {EdgeLabelRenderer, getSmoothStepPath} from "@vue-flow/core";
    import AddTaskButton from "../buttons/AddTaskButton.vue";
    import {EVENTS} from "../../utils/constants.js";
    import {Tooltip} from "bootstrap";

    export default {
        data() {
            return {
                tooltips: [],
            }
        },
        props: {
            id: String,
            data: Object,
            sourceX: Number,
            sourceY: Number,
            targetX: Number,
            targetY: Number,
            markerEnd: String,
            sourcePosition: String,
            targetPosition: String,
        },
        components: {
            AddTaskButton,
            EdgeLabelRenderer
        },
        computed: {
            EVENTS() {
                return EVENTS
            },
            classes() {
                return {
                    "vue-flow__edge-path": true,
                    ["stroke-" + this.data.color]: this.data.color,
                }
            },
        },
        setup(props) {
            const path = computed(() => getSmoothStepPath(props));

            return {
                path,
            };
        },
        mounted(){
            const tooltipTriggerList = [].slice.call(document.querySelectorAll("[data-bs-toggle=\"tooltip\"]"));
            this.tooltips = tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new Tooltip(tooltipTriggerEl, {
                    trigger : "hover"
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
        },
        inheritAttrs: false,
    };
</script>

<template>
    <path
        :id="id"
        :class="'vue-flow__edge-path stroke-'+data.color"
        :style="data.haveDashArray ?
            {
                strokeDasharray: '2',
            }:
            {}"
        :d="path[0]"
        :marker-end="markerEnd"
    />

    <EdgeLabelRenderer style="z-index: 10">
        <div
            :style="{
                pointerEvents: 'all',
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`,
            }"
        >
            <AddTaskButton
                v-if="!data.disabled && data.haveAdd != undefined"
                :add-task="true"
                @click="$emit(EVENTS.ADD_TASK, data.haveAdd)"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                :title="$t('add task')"
            />
        </div>
    </EdgeLabelRenderer>
</template>
