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

<script setup>
    import TaskIcon from "../misc/TaskIcon.vue";
</script>

<script>
    import InformationOutline from "vue-material-design-icons/InformationOutline.vue";
    import {EVENTS} from "../../utils/constants";
    import ArrowExpand from "vue-material-design-icons/ArrowExpand.vue";
    import OpenInNew from "vue-material-design-icons/OpenInNew.vue";
    import Tooltip from "../misc/Tooltip.vue";
    import Utils from "../../utils/Utils";
    import {EXECUTION_INJECTION_KEY} from "../topology/injectionKeys";

    export default {
        components: {
            ArrowExpand,
            InformationOutline,
            OpenInNew,
            Tooltip
        },

        emits: [
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
        ],
        inheritAttrs: false,
        props: {
            id: {
                type: String,
                default: undefined
            },
            title: {
                type: String,
                default: undefined
            },
            type: {
                type: String,
                default: undefined
            },
            disabled: {
                type: Boolean,
                default: undefined
            },
            state: {
                type: String,
                default: undefined
            },
            data: {
                type: Object,
                required: true
            },
            icons: {
                type: Object,
                default: undefined
            },
            iconComponent: {
                type: Object,
                default: undefined
            }
        },
        methods: {
            mouseover() {
                this.$emit(EVENTS.MOUSE_OVER, this.data.node);
            },
            mouseleave() {
                this.$emit(EVENTS.MOUSE_LEAVE);
            },
        },
        data() {
            return {
                filter: undefined,
                isOpen: false,
            };
        },
        inject: {
            execution: { 
                from: EXECUTION_INJECTION_KEY,
            },
        },
        computed: {
            Utils() {
                return Utils
            },
            borderColor() {
                const color = this.data.color ? this.data.color === "default" ? null : this.data.color : null
                return color ? color : this.expandable ? "blue" : null
            },
            EVENTS() {
                return EVENTS
            },
            expandable() {
                return this.data?.expandable || false
            },
            description() {
                const node = this.data.node.task ?? this.data.node.trigger ?? null
                if (node) {
                    return node.description ?? null
                }
                return null
            },
            trimmedId() {
                return Utils.afterLastDot(this.id);
            },
            taskIconBg() {
                return !["default", "danger"].includes(this.data.color) ? this.data.color : "";
            },
            stateColor() {
                switch (this.state) {
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
            },
            classes() {
                return {
                    "unused-path": this.data.unused,
                    [`border-${this.borderColor}`]: this.borderColor,
                    "disabled": this.data.node.task?.disabled || this.data.parent?.taskNode?.task?.disabled,
                    [this.$attrs.class]: true
                }
            },
            cls() {
                if (this.data.node.triggerDeclaration) {
                    return this.data.node.triggerDeclaration.type;
                }

                if (!this.data.node?.task) {
                    return undefined;
                }

                return this.data.node.task.type;
            },
            hoverTooltip() {
                if (this.data.node.type?.endsWith("SubflowGraphTask")) {
                    const subflowIdContainer = this.data.node.task.subflowId ?? this.data.node.task;

                    return subflowIdContainer.namespace + " " + subflowIdContainer.flowId;
                }

                return this.trimmedId;
            }
        }
    }
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
