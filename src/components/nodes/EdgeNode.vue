<script>
    import {computed} from "vue";
    import {EdgeLabelRenderer, getSmoothStepPath} from "@vue-flow/core";
    import AddTaskButton from "../buttons/AddTaskButton.vue";
    import {EVENTS} from "../../utils/constants.js";
    import Tooltip from "../misc/Tooltip.vue";
    import Utils from "../../utils/Utils.js";

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
            <tooltip :title="Utils.translate('add task')">
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
