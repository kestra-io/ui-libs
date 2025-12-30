<template>
    <path
        v-if="path?.length"
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

    <EdgeLabelRenderer style="z-index: 10" v-if="path?.length">
        <div
            :style="{
                pointerEvents: 'all',
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${path[1] + labelXOffset}px,${path[2] + labelYOffset}px)`,
                flexDirection: isVertical ? 'column' : 'row',
            }"
            class="edge-label-wrapper"
        >
            <tooltip :title>
                <AddTaskButton
                    v-if="data.haveAdd"
                    :add-task="true"
                    @click="$emit(EVENTS.ADD_TASK, data.haveAdd)"
                    :class="{'text-danger': data.color}"
                />
            </tooltip>
            <span v-if="label" class="edge-label" :class="data?.color ? `text-${data.color}` : ''">{{ typeof label === 'string' ? label : label?.text }}</span>
        </div>
    </EdgeLabelRenderer>
</template>

<script lang="ts" setup>
    import {computed, PropType} from "vue";
    import {useI18n} from "vue-i18n";
    import {EdgeLabelRenderer, getSmoothStepPath} from "@vue-flow/core";
    import AddTaskButton from "../buttons/AddTaskButton.vue";
    import {EVENTS} from "../../utils/constants";
    import Tooltip from "../misc/Tooltip.vue";

    const props = defineProps({
        id: {
            type: String,
            default: undefined,
        },
        data: {
            type: Object as PropType<any>,
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
        label: {
            type: [String, Object],
            default: undefined,
        }
    })
        
    const classes = computed(() => {
        return props.data ? {
            "vue-flow__edge-path": true,
            ["stroke-" + props.data.color]: props.data.color,
            "unused-path": props.data.unused
        } : {};
    })


    let t = (s: string) => s;
    try{
        const {t: realT} = useI18n();
        t = realT;
    } catch {
        // ignore, not in a i18n context
    }

    const title = computed(() => {
        const {haveAdd} = props.data ?? {};
        return `${t("add task")} ${haveAdd?.length === 2 ? `${t(haveAdd[1])} ${haveAdd[0]}` : ""}`.trim();
    })


    const path = computed(() => getSmoothStepPath(props as any));
    const isVertical = computed(() => props.sourcePosition === "bottom");

    const OFFSET = 14; 
    const labelYOffset = computed(() => {
        const boundary = props.data?.edgeBoundary;
        if (boundary === "top") return -OFFSET;
        if (boundary === "bottom") return OFFSET;
        const p = path.value;
        if (p && p.length >= 3 && props.targetY !== undefined) {
             if (isVertical.value) {
                const baseOffset = 15;
                const editOffset = props.data?.haveAdd ? 35 : 0;
                return props.targetY - (baseOffset + editOffset) - p[2];
             } else {
                return props.targetY - p[2];
             }
        }
        return 0;
    });

    const labelXOffset = computed(() => {
        const p = path.value;
        if (p && p.length >= 3 && props.targetX !== undefined) {
            if (isVertical.value) {
                return props.targetX - p[1];
            } else {
                if (!props.data?.isSwitch) {
                    return 0;
                }
                const baseOffset = 40;
                const editOffset = props.data?.haveAdd ? 30 : 0;
                return props.targetX - (baseOffset + editOffset) - p[1];
            }
        }
        return 0;
    });

    defineOptions({
        inheritAttrs: false,
    });
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

    .vue-flow__edge-path {
        stroke-dasharray: 3 5;
    }

    .edge-label {
        font-size: 12px;
        color: var(--ks-content-secondary);
        background: var(--ks-background-card);
        border: 1px solid var(--ks-border-primary);
        padding: 2px 8px;
        border-radius: 4px;
    }
    
    .text-danger {
        color: var(--ks-content-error);
        border-color: var(--ks-border-error);
    }
    
    .edge-label-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
    }
</style>
