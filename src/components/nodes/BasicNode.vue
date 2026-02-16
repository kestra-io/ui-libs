<template>
    <div
        class="node-wrapper"
        :style="{borderColor: state ? `var(--ks-border-${state.toLowerCase()})` : undefined}"
        :class="classes"
        @mouseover="mouseover"
        @mouseleave="mouseleave"
    >
        <div class="node-core">
            <div class="icon rounded">
                <component :is="iconComponent || TaskIcon" :cls="cls" :class="taskIconBg" class="rounded bg-white" theme="light" :icons="icons" />
            </div>
            <div class="node-content">
                <div class="d-flex node-title">
                    <div
                        class="text-truncate task-title"
                    >
                        <tooltip :title="hoverTooltip">
                            {{ displayTitle }}
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
        <div class="additional-info" v-if="node?.additionalInfo">
            <div v-for="(info, key) in node.additionalInfo" :key="key">
                <span class="info-left">{{ key }}</span><span class="info-right">{{ info }}</span>
            </div>
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

    const expandable = computed(() => {
        return props.data?.expandable || false
    })

    const node = computed(() => {
        return props.data.node?.plugin ?? props.data.node?.task ?? props.data.node?.trigger ?? null
    })

    const description = computed(() => {
        return node.value?.description ?? null
    })

    const trimmedId = computed(() => {
        return Utils.afterLastDot(props.id ?? "");
    })

    const taskIconBg = computed(() => {
        return !["default", "danger"].includes(props.data.color) ? props.data.color : "";
    })

    const classes = computed(() => {
        return [{
            "unused-path": props.data.unused,
            "disabled": node.value?.disabled || props.data.parent?.taskNode?.task?.disabled,
            "running-border-animation": props.state === "RUNNING"
        }, props.class]
    })

    const cls = computed(() => {
        if (props.data.node.triggerDeclaration) {
            return props.data.node.triggerDeclaration.type;
        }

        if (!node.value) {
            return undefined;
        }

        return node.value?.type;
    })

    const hoverTooltip = computed(() => {
        if (node.value?.type?.endsWith("SubflowGraphTask")) {
            const subflowIdContainer = node.value.subflowId ?? node.value;

            return subflowIdContainer.namespace + " " + subflowIdContainer.flowId;
        }

        return trimmedId.value;
    })

    const displayTitle = computed(() => {
        return props.title ?? trimmedId.value;
    })
</script>

<style lang="scss" scoped>
    .node-wrapper {
        box-shadow: 0 12px 12px 0 rgba(130, 103, 158, 0.10);
        border: 1px solid var(--ks-border-primary);
        border-radius: .5rem;
        width: 184px;
        .node-core{
            background-color: var(--ks-background-card);

            height: 44px;
            margin: 0;
            padding: 8px;
            display: flex;
            z-index: 150000;
            align-items: center;
            border-top-left-radius: .5rem;
            border-top-right-radius: .5rem;
            
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

    .running-border-animation {
        border: none !important;
        &:before{
            position: absolute;
            content: '';
            z-index: -1;
            top: -1px;
            left: -1px;
            right: -1px;
            bottom: -1px;
            border-radius: .55rem;
            background: conic-gradient(from calc(var(--border-angle-running)) at 50% 50%, 
                var(--ks-border-running) 0%, 
                var(--ks-border-running) 10%, 
                var(--ks-border-primary) 40%, 
                var(--ks-border-primary) 60%, 
                var(--ks-border-running) 90%, 
                var(--ks-border-running) 100%);
            animation: running-border 3s linear infinite;
        }
    }

    .additional-info {
        font-size: .5rem;
        background-color: var(--ks-background-body);
        border-bottom-left-radius: .5rem;
        border-bottom-right-radius: .5rem;
        > div{
            border-top: 1px solid var(--ks-border-primary);
            padding: 0.2rem .5rem;
            display: flex;
            justify-content: space-between;
        }
    }

    @keyframes running-border {
        to {
            --border-angle-running: 1turn;
        }
    }

    @property --border-angle-running {
        syntax: "<angle>";
        inherits: true;
        initial-value: 0turn;
    }
</style>
