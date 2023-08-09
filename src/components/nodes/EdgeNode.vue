<script>
    import {computed} from "vue";
    import {EdgeLabelRenderer, getSmoothStepPath} from "@vue-flow/core";
    import AddTaskButton from "../buttons/AddTaskButton.vue";
    import {EVENTS} from "../../utils/constants.js";

    export default {
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
            />
        </div>
    </EdgeLabelRenderer>
</template>