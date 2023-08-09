<template>
    <Handle type="source" :position="sourcePosition" />
    <basic-node
        :id="id"
        :data="data"
        :state="state"
        @show-description="forwardEvent(EVENTS.SHOW_DESCRIPTION, $event)"
        @expand="forwardEvent(EVENTS.EXPAND, id)"
        @open-link="forwardEvent(EVENTS.OPEN_LINK)"
        @mouseover="forwardEvent(EVENTS.MOUSE_OVER, $event)"
        @mouseleave="forwardEvent(EVENTS.MOUSE_LEAVE)"
    >
        <template #content>
            <execution-informations v-if="data.execution" :color="color" />
        </template>
        <template #badge-button-before>
            <span
                v-if="execution"
                class="rounded-button"
                :class="[`bg-${color}`]"
                @click="$emit(EVENTS.SHOW_LOGS, {id, taskRuns})"
            >
                <TextBoxSearch class="button-icon" alt="Show logs" />
            </span>
            <span
                v-if="!data.execution && !data.isReadOnly && data.isFlowable"
                class="rounded-button"
                :class="[`bg-${color}`]"
                @click="$emit(EVENTS.ADD_ERROR, {task: data.node.task})"
            >
                <InformationOutline class="button-icon" alt="Edit task" />
            </span>
            <span
                v-if="!data.execution && !data.isReadOnly"
                class="rounded-button"
                :class="[`bg-${color}`]"
                @click="$emit(EVENTS.EDIT, {task: data.node.task, section: SECTIONS.TASKS})"
            >
                <Pencil class="button-icon" alt="Edit task" />
            </span>
            <span
                v-if="!data.execution && !data.isReadOnly"
                class="rounded-button"
                :class="[`bg-${color}`]"
                @click="$emit(EVENTS.DELETE, {id, section: SECTIONS.TASKS})"
            >
                <Delete class="button-icon" alt="Delete task" />
            </span>
        </template>
    </basic-node>
    <Handle type="target" :position="targetPosition" />
</template>

<script>
    import BasicNode from "./BasicNode.vue";
    import {Handle} from "@vue-flow/core";
    import State from "../../utils/state.js";
    import {EVENTS, SECTIONS} from "../../utils/constants.js";
    import ExecutionInformations from "../misc/ExecutionInformations.vue";
    import Pencil from "vue-material-design-icons/Pencil.vue";
    import Delete from "vue-material-design-icons/Delete.vue";
    import TextBoxSearch from "vue-material-design-icons/TextBoxSearch.vue";
    import InformationOutline from "vue-material-design-icons/InformationOutline.vue"

    export default {
        name: "Task",
        inheritAttrs: false,
        computed: {
            SECTIONS() {
                return SECTIONS
            },
            EVENTS() {
                return EVENTS
            },
            color() {
                return this.data.color ?? "primary"
            },
            execution() {
                return this.data.execution
            },
            taskRunList() {
                return this.execution && this.execution.taskRunList ? this.execution.taskRunList : []
            },
            taskRuns() {
                return this.taskRunList.filter(t => t.taskId === this.data.node.task.id)
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
        components: {
            Pencil,
            Delete,
            ExecutionInformations,
            Handle,
            BasicNode,
            TextBoxSearch,
            InformationOutline
        },
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
            }
        },
        methods: {
            forwardEvent(event, payload) {
                this.$emit(event, payload)
            },
        }
    }
</script>
<style scoped lang="scss">
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
</style>