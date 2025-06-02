<template>
    <path
        :id="id"
        :class="classes"
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
            <tooltip :title>
                <AddTaskButton
                    v-if="data.haveAdd"
                    :add-task="true"
                    @click="$emit(EVENTS.ADD_TASK, data.haveAdd)"
                    :class="{'text-danger': data.color}"
                />
            </tooltip>
        </div>
    </EdgeLabelRenderer>
</template>

<script>
    import {computed} from "vue";
    import {EdgeLabelRenderer, getSmoothStepPath} from "@vue-flow/core";
    import AddTaskButton from "../buttons/AddTaskButton.vue";
    import {EVENTS} from "../../utils/constants";
    import Tooltip from "../misc/Tooltip.vue";
    import Utils from "../../utils/Utils";

    export default {
        data() {
            return {
                tooltips: [],
            }
        },
        props: {
            id: {
                type: String,
                default: undefined,
            },
            data: {
                type: Object,
                default: undefined,
            },
            sourceX: {
                type: Number,
                default: undefined,
            },
            sourceY: {
                type: Number,
                default: undefined,
            },
            targetX: {
                type: Number,
                default: undefined,
            },
            targetY: {
                type: Number,
                default: undefined,
            },
            markerEnd: {
                type: String,
                default: undefined,
            },
            sourcePosition: {
                type: String,
                default: undefined,
            },
            targetPosition: {
                type: String,
                default: undefined,
            },
        },
        components: {
            AddTaskButton,
            EdgeLabelRenderer,
            Tooltip
        },
        computed: {
            Utils() {
                return Utils
            },
            EVENTS() {
                return EVENTS
            },
            classes() {
                return {
                    "vue-flow__edge-path": true,
                    ["stroke-" + this.data.color]: this.data.color,
                    "unused-path": this.data.unused
                }
            },
            title() {
                const {haveAdd} = this.data;
                return `${this.$t("add task")} ${haveAdd?.length === 2 ? `${this.$t(haveAdd[1])} ${haveAdd[0]}` : ""}`.trim();
            }
        },
        setup(props) {
            const path = computed(() => getSmoothStepPath(props));

            return {
                path,
            };
        },
        inheritAttrs: false,
    };
</script>

<style scoped>
    .stroke-danger {
        stroke: var(--ks-border-error);
    }

    .stroke-error {
        stroke: var(--ks-border-error);
    }

    .stroke-warning {
        stroke: var(--ks-border-warning);
    }
</style>
