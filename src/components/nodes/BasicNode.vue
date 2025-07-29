<template>
    <div
        :class="classes"
        class="node-wrapper rounded-3 border"
        @mouseover="mouseover"
        @mouseleave="mouseleave"
    >
        <div v-if="state" class="status-div" :class="[`bg-${stateColor}`]" />
        <div class="icon rounded">
            <component :is="iconComponent || TaskIcon" :cls="cls" :class="taskIconBg" class="rounded bg-white" theme="light" :icons="icons" />
        </div>
        <div class="node-content">
            <div class="d-flex node-title">
                <div
                    class="text-truncate task-title"
                >
                    <tooltip :title="hoverTooltip">
                        {{ title ?? trimmedId }}
                    </tooltip>
                </div>
                <span
                    class="d-flex"
                    v-if="description"
                >
                    <tooltip :title="$t('show description')" class="d-flex align-items-center">
                        <InformationOutline
                            @click="$emit(EVENTS.SHOW_DESCRIPTION, {id: trimmedId, description:description})"
                            class="description-button ms-2"
                        />
                    </tooltip>
                </span>
            </div>
            <slot name="content" />
        </div>
        <div class="text-white top-button-div">
            <slot name="badge-button-before" />
            <span
                v-if="data.link"
                class="circle-button"
                :class="[`bg-${data.color}`]"
                @click="$emit(EVENTS.OPEN_LINK, {link: data.link})"
            >
                <tooltip :title="$t('open')">
                    <OpenInNew class="button-icon" alt="Open in new tab" />
                </tooltip>
            </span>
            <span
                v-if="expandable"
                class="circle-button"
                :class="[`bg-${data.color}`]"
                @click="$emit(EVENTS.EXPAND)"
            >
                <tooltip :title="$t('expand')">
                    <ArrowExpand class="button-icon" alt="Expand task" />
                </tooltip>
            </span>
            <slot name="badge-button-after" />
        </div>
    </div>
</template>

<script lang="ts" setup>
    import {computed} from "vue";
    import TaskIcon from "../misc/TaskIcon.vue";
    import InformationOutline from "vue-material-design-icons/InformationOutline.vue";
    import {EVENTS} from "../../utils/constants";
    import ArrowExpand from "vue-material-design-icons/ArrowExpand.vue";
    import OpenInNew from "vue-material-design-icons/OpenInNew.vue";
    import Tooltip from "../misc/Tooltip.vue";
    import Utils from "../../utils/Utils";
    import {EXECUTION_INJECTION_KEY} from "../topology/injectionKeys";

    const emit = defineEmits([
        EVENTS.EXPAND,
        EVENTS.OPEN_LINK,
        EVENTS.SHOW_LOGS,
        EVENTS.MOUSE_OVER,
        EVENTS.MOUSE_LEAVE,
        EVENTS.ADD_ERROR,
        EVENTS.EDIT,
        EVENTS.DELETE,
        EVENTS.ADD_TASK,
        EVENTS.SHOW_DESCRIPTION
    ]);

    defineOptions({
        name: "BasicNode",
        inheritAttrs: false,
    });

    const props = defineProps<{
        id?: string;
        title?: string;
        type?: string;
        disabled?: boolean;
        state?: string;
        data: any;
        icons: any;
        iconComponent: any;
        class?: string | string[] | Record<string, boolean>;
    }>();

    function mouseover() {
        emit(EVENTS.MOUSE_OVER, props.data.node);
    }

    function mouseleave() {
        emit(EVENTS.MOUSE_LEAVE);
    }

    const borderColor = computed(() => {
        const color = props.data.color ? props.data.color === "default" ? null : props.data.color : null
        return color ? color : expandable.value ? "blue" : null
    })

    const expandable = computed(() => {
        return props.data?.expandable || false
    })

    const description = computed(() => {
        const node = props.data.node.task ?? props.data.node.trigger ?? null
        if (node) {
            return node.description ?? null
        }
        return null
    })

    const trimmedId = computed(() => {
        return Utils.afterLastDot(props.id ?? "");
    })

    const taskIconBg = computed(() => {
        return !["default", "danger"].includes(props.data.color) ? props.data.color : "";
    })

    const stateColor = computed(() => {
        switch (props.state) {
        case "RUNNING":
            return "primary"
        case "SUCCESS":
            return "success"
        case "WARNING":
            return "warning"
        case "FAILED":
            return "danger"
        default:
            return null;
        }
    })

    const classes = computed(() => {
        return [{
                    "unused-path": props.data.unused,
                    [`border-${borderColor.value}`]: borderColor.value,
                    "disabled": props.data.node.task?.disabled || props.data.parent?.taskNode?.task?.disabled,
                },
                props.class
        ]
    })

    const cls = computed(() => {
        if (props.data.node.triggerDeclaration) {
            return props.data.node.triggerDeclaration.type;
        }

        if (!props.data.node?.task) {
            return undefined;
        }

        return props.data.node.task.type;
    })

    const hoverTooltip = computed(() => {
        if (props.data.node.type?.endsWith("SubflowGraphTask")) {
            const subflowIdContainer = props.data.node.task.subflowId ?? props.data.node.task;

            return subflowIdContainer.namespace + " " + subflowIdContainer.flowId;
        }

        return trimmedId.value;
    })
</script>

<style lang="scss" scoped>
    .node-wrapper {
        background-color: var(--ks-background-card);

        width: 184px;
        height: 44px;
        margin: 0;
        padding: 8px;
        display: flex;
        z-index: 150000;
        align-items: center;
        box-shadow: 0 12px 12px 0 rgba(130, 103, 158, 0.10);

        &.execution-no-taskrun, &.disabled {
            background-color: var(--ks-background-card);
        }

        &.disabled {
            .task-title {
                color: var(--ks-content-secondary);
                text-decoration: line-through;
            }
        }

        .icon {
            margin: 0.2rem;
            width: 25px;
            height: 25px;
            border: 0.4px solid var(--ks-border-primary);
            min-width: 25px;
            min-height: 25px;
        }
    }

    .node-content {
        display: flex;
        flex-direction: column;
        justify-content: center;
        margin-left: 0.7rem;

        > .node-title {
            width: 125px;
        }
    }

    .description-button {
        color: var(--ks-content-secondary);
        cursor: pointer;
    }

    .material-design-icon.icon-rounded {
        border-radius: 1rem;
        padding: 1px;
    }

    .button-icon {
        font-size: 0.75rem;
    }

    .task-title {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--ks-content-primary);
        flex-grow: 1;
    }

    .status-div {
        width: 8px;
        height: 100%;
        position: absolute;
        left: -0.04438rem;
        border-radius: 0.5rem 0 0 0.5rem;
    }
</style>
