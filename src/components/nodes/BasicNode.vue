<template>
    <div
        :class="[`border-${!expandable ? data.color : 'blue'}`]"
        class="node-wrapper rounded-3 border"
        @mouseover="mouseover"
        @mouseleave="mouseleave"
    >
        <div v-if="state" class="status-div" :class="[`bg-${stateColor}`]"/>
        <div>
            <TaskIcon :icon="data.icon" :cls="cls" :class="taskIconBg"/>
        </div>
        <div class="node-content">
            <div class="d-flex justify-content-around">
                <div
                    class="text-truncate task-title"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    :title="id"
                >
                    <span> {{ id }} </span>
                </div>
                <span
                    class="d-flex"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    :title="$t('show description')"
                >
                    <InformationOutline
                        v-if="description"
                        @click="$emit(EVENTS.SHOW_DESCRIPTION, {id: id, description:description})"
                        class="description-button mx-2"
                    />
                </span>
            </div>
            <slot name="content"/>
        </div>
        <div class="position-absolute top-0 text-white d-flex top-button-div">
            <slot name="badge-button-before"/>
            <span
                v-if="link"
                class="rounded-button"
                :class="[`bg-${data.color}`]"
                @click="$emit(EVENTS.OPEN_LINK, linkData)"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                :title="$t('open')"
            >
                <OpenInNew class="button-icon" alt="Open in new tab"/>
            </span>
            <span
                v-if="expandable"
                class="rounded-button"
                :class="[`bg-${data.color}`]"
                @click="$emit(EVENTS.EXPAND)"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                :title="$t('expand')"
            >
                <ArrowExpand class="button-icon" alt="Expand task"/>
            </span>
            <slot name="badge-button-after"/>
        </div>
    </div>
</template>

<script>
    import TaskIcon from "../misc/TaskIcon.vue";
    import InformationOutline from "vue-material-design-icons/InformationOutline.vue";
    import {EVENTS} from "../../utils/constants.js";
    import ArrowExpand from "vue-material-design-icons/ArrowExpand.vue";
    import OpenInNew from "vue-material-design-icons/OpenInNew.vue";
    import {Tooltip} from "bootstrap";
    import {VueFlowUtils} from "../../index.js";
    import {mapState} from "vuex";

    export default {
        components: {
            ArrowExpand,
            TaskIcon,
            InformationOutline,
            OpenInNew
        },
        mounted() {
            const tooltipTriggerList = [].slice.call(document.querySelectorAll("[data-bs-toggle=\"tooltip\"]"));
            this.tooltips = tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new Tooltip(tooltipTriggerEl, {
                    trigger: "hover"
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
        emits: [
            EVENTS.EXPAND,
            EVENTS.OPEN_LINK,
            EVENTS.SHOW_LOGS,
            EVENTS.MOUSE_OVER,
            EVENTS.MOUSE_LEAVE,
            EVENTS.ADD_ERROR,
            EVENTS.EDIT,
            EVENTS.DELETE,
            EVENTS.ADD_TASK
        ],
        inheritAttrs: false,
        props: {
            id: {
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
            style: {
                type: Object,
                required: false,
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
        computed: {
            ...mapState("execution", ["execution"]),
            EVENTS() {
                return EVENTS
            },
            expandable() {
                return this.data?.expandable || false
            },
            link() {
                return this.data?.link || false
            },
            description() {
                const node = this.data.node.task ?? this.data.node.trigger ?? null
                if (node) {
                    return node.description ?? null
                }
                return null
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
            linkData() {
                if(this.data.node.task) {
                    return {link: VueFlowUtils.linkDatas(this.data.node.task, this.execution)}
                }
                return null
            },
            cls() {
                return this.data.node?.task ? this.data.node.task.type : this.data.node?.trigger ? this.data.node.trigger.type : null
            }
        },
    }
</script>

<style lang="scss" scoped>
    .node-wrapper {
        background-color: var(--bs-white);

        html.dark & {
            background-color: var(--card-bg);
        }

        width: 184px;
        height: 44px;
        margin: 0;
        padding: 8px;
        display: flex;
        z-index: 150000;
        align-items: center;
        box-shadow: 0 12px 12px 0 rgba(130, 103, 158, 0.10);
    }

    .node-content {
        display: flex;
        flex-direction: column;
        justify-content: center;
        margin-left: 0.7rem;
    }

    .description-button {
        color: var(--bs-gray-600);
        cursor: pointer;
        width: 25px;
    }

    .material-design-icon.icon-rounded {
        border-radius: 1rem;
        padding: 1px;
    }

    .rounded-button {
        border-radius: 1rem;
        width: 1rem;
        height: 1rem;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-left: 0.25rem;
    }

    .button-icon {
        font-size: 0.75rem;
    }

    .task-title {
        font-size: 0.75rem;
        font-weight: 700;
        line-height: 1.5rem;
        color: var(--bs-black);

        html.dark & {
            color: var(--bs-white);
        }

        width: 6rem;
    }


    .status-div {
        width: 8px;
        height: 100%;
        position: absolute;
        left: -0.04438rem;
        border-radius: 0.5rem 0 0 0.5rem;
    }
</style>
