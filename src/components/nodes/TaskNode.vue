<template>
    <Handle type="source" :position="sourcePosition" />
    <basic-node
        :id="id"
        :data="dataWithLink"
        :state="state"
        :class="classes"
        :icons="icons"
        :icon-component="iconComponent"
        @show-description="forwardEvent(EVENTS.SHOW_DESCRIPTION, $event)"
        @expand="forwardEvent(EVENTS.EXPAND, expandData)"
        @open-link="forwardEvent(EVENTS.OPEN_LINK, $event)"
        @mouseover="forwardEvent(EVENTS.MOUSE_OVER, $event)"
        @mouseleave="forwardEvent(EVENTS.MOUSE_LEAVE)"
    >
        <template #content>
            <execution-informations v-if="taskExecution" :execution="taskExecution" :task="data.node.task" :color="color" :uid="data.node.uid" />
        </template>
        <template #badge-button-before>
            <span
                v-if="data.node.task && data.node.task.runIf"
                class="circle-button"
                :class="[`bg-warning`]"
                @click="$emit(EVENTS.SHOW_CONDITION, {id: taskId, task: data.node.task, section: SECTIONS.TASKS})"
            >
                <tooltip :title="$t('show task condition')">
                    <SendLock class="button-icon" alt="Show condition" />
                </tooltip>
            </span>
            <span
                v-if="taskExecution"
                class="circle-button"
                :class="[`bg-${color}`]"
                @click="$emit(EVENTS.SHOW_LOGS, {id: taskId, execution: taskExecution, taskRuns})"
            >
                <tooltip :title="$t('show task logs')">
                    <TextBoxSearch class="button-icon" alt="Show logs" />
                </tooltip>
            </span>
            <span
                v-if="!taskExecution && !data.isReadOnly && data.isFlowable"
                class="circle-button"
                :class="[`bg-${color}`]"
                @click="$emit(EVENTS.ADD_ERROR, {task: data.node.task})"
            >
                <tooltip :title="$t('add error handler')">
                    <AlertOutline class="button-icon" alt="Add error handler" />
                </tooltip>
            </span>
            <span
                v-if="!taskExecution && !data.isReadOnly"
                class="circle-button"
                :class="[`bg-${color}`]"
                @click="$emit(EVENTS.EDIT, {task: data.node.task, section: SECTIONS.TASKS})"
            >
                <tooltip :title="$t('edit')">
                    <Pencil class="button-icon" alt="Edit task" />
                </tooltip>
            </span>
            <span
                v-if="!taskExecution && !data.isReadOnly"
                class="circle-button"
                :class="[`bg-${color}`]"
                @click="$emit(EVENTS.DELETE, {id: taskId, section: SECTIONS.TASKS})"
            >
                <tooltip :title="$t('delete')">
                    <Delete class="button-icon" alt="Delete task" />
                </tooltip>
            </span>
        </template>
    </basic-node>
    <Handle type="target" :position="targetPosition" />
</template>
<script setup>
    import BasicNode from "./BasicNode.vue";
</script>
<script>
    import {Handle} from "@vue-flow/core";
    import State from "../../utils/state";
    import {EVENTS, SECTIONS} from "../../utils/constants";
    import ExecutionInformations from "../misc/ExecutionInformations.vue";
    import Pencil from "vue-material-design-icons/Pencil.vue";
    import Delete from "vue-material-design-icons/Delete.vue";
    import TextBoxSearch from "vue-material-design-icons/TextBoxSearch.vue";
    import AlertOutline from "vue-material-design-icons/AlertOutline.vue"
    import SendLock from "vue-material-design-icons/SendLock.vue"
    import {mapGetters, mapState} from "vuex";
    import Tooltip from "../misc/Tooltip.vue"
    import Utils from "../../utils/Utils";

    export default {
        name: "Task",
        components: {
            Pencil,
            Delete,
            ExecutionInformations,
            Handle,
            TextBoxSearch,
            AlertOutline,
            Tooltip,
            SendLock
        },
        inheritAttrs: false,
        computed: {
            ...mapState("execution", ["execution"]),
            ...mapGetters("execution", ["subflowsExecutions"]),
            SECTIONS() {
                return SECTIONS
            },
            EVENTS() {
                return EVENTS
            },
            color() {
                return this.data.color ?? "primary"
            },
            taskId() {
                return Utils.afterLastDot(this.id);
            },
            taskRunList() {
                return this.taskExecution && this.taskExecution.taskRunList ? this.taskExecution.taskRunList : []
            },
            taskExecution() {
                const executionId = this.data.executionId;
                if(executionId) {
                    return executionId === this.execution?.id ? this.execution
                        : Object.values(this.subflowsExecutions).filter(execution => execution.id === this.data.executionId)?.[0];
                }

                return undefined;
            },
            taskRuns() {
                return this.taskRunList.filter(t => t.taskId === Utils.afterLastDot(this.data.node.uid))
            },
            state() {
                if (!this.taskRuns) {
                    return null;
                }

                if (this.taskRuns.length === 1) {
                    return this.taskRuns[0].state.current
                }

                const allStates = this.taskRuns.map(t => t.state.current);

                const SORT_STATUS = [
                    State.FAILED,
                    State.KILLED,
                    State.WARNING,
                    State.KILLING,
                    State.RUNNING,
                    State.SUCCESS,
                    State.RESTARTED,
                    State.CREATED,
                ];

                // sorting based on SORT_STATUS array
                const result = allStates
                    .map((item) => {
                        const n = SORT_STATUS.indexOf(item[1]);
                        SORT_STATUS[n] = undefined;
                        return [n, item]
                    })
                    .sort()
                    .map((j) => j[1])
                return result[0];
            },
            classes() {
                return {
                    "execution-no-taskrun": this.taskExecution && this.taskRuns && this.taskRuns.length === 0,
                }
            },
            expandData() {
                return {
                    id: this.id,
                    type: this.data.node.task.type
                }
            },
            dataWithLink() {
                if(this.data.node.type.endsWith("SubflowGraphTask") && this.enableSubflowInteraction){
                    const subflowIdContainer = this.data.node.task.subflowId ?? this.data.node.task;
                    return {
                        ...this.data,
                        link: {
                            namespace: subflowIdContainer.namespace,
                            id: subflowIdContainer.flowId,
                            executionId: this.taskExecution?.taskRunList
                                .filter(taskRun => taskRun.taskId === this.data.node.task.id && taskRun.outputs?.executionId)
                                ?.[0]?.outputs?.executionId
                        }
                    }
                }

                return this.data;
            }
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
            EVENTS.SHOW_CONDITION
        ],
        props: {
            data: {
                type: Object,
                required: true,
            },
            sourcePosition: {
                type: String,
                required: true
            },
            targetPosition: {
                type: String,
                required: true
            },
            id: {
                type: String,
                required: true
            },
            icons: {
                type: Object,
                default: undefined
            },
            iconComponent: {
                type: Object,
                default: undefined
            },
            enableSubflowInteraction: {
                type: Boolean,
                default: true
            }
        },
        methods: {
            forwardEvent(event, payload) {
                this.$emit(event, payload)
            },
        }
    }
</script>

