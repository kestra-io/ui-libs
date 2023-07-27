<script lang="ts" setup>
    import type {EdgeProps, Position} from '@vue-flow/core'
    import {EdgeLabelRenderer, getSmoothStepPath, useEdge} from '@vue-flow/core'
    import {computed} from 'vue'
    import AddTaskButton from "../buttons/AddTaskButton.vue";

    interface CustomEdgeProps<T = any> extends /* @vue-ignore */ EdgeProps<T> {
        id: string
        data: T
        sourceX: number
        sourceY: number
        targetX: number
        targetY: number
        sourcePosition: Position
        targetPosition: Position
    }

    const props = defineProps<CustomEdgeProps>()
    const path = computed(() => getSmoothStepPath(props))
</script>

<script lang="ts">
    export default {
        inheritAttrs: false
    }
</script>

<template>
    <path
        :id="id"
        class="vue-flow__edge-path"
        :class="data.class"
        :d="path[0]"
    />

    <path
        :d="path[0]"
        fill="none"
        stroke-opacity="0"
        stroke-width="20"
    />

    <EdgeLabelRenderer style="z-index: 10">

        <div
            :style="{
                pointerEvents: 'all',
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`,
            }"
        >
            <AddTaskButton :addTask="true"/>

        </div>
    </EdgeLabelRenderer>

</template>

<style lang="scss">
    .vue-flow__edge-path {
        stroke-width: 25px;

        &.ERROR {
            stroke: var(--bs-danger);
        }

        &.DYNAMIC {
            stroke: var(--bs-teal);
        }

        &.CHOICE {
            stroke: var(--bs-orange);
        }
    }

</style>
