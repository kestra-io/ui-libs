<template>
    <!-- <Handle type="source" :position="sourcePosition" /> -->
    <basic-node
        :id="id"
        :data="dataWithLink"
        :state="state"
        :class="classes"
        :icons="icons"
        :icon-component="iconComponent"
        @show-description="emit(EVENTS.SHOW_DESCRIPTION, $event)"
        @expand="emit(EVENTS.EXPAND, expandData)"
        @open-link="emit(EVENTS.OPEN_LINK, $event)"
        @mouseover="emit(EVENTS.MOUSE_OVER, $event)"
        @mouseleave="emit(EVENTS.MOUSE_LEAVE)"
    >
        <template #content>
            <execution-informations 
                v-if="taskExecution"
                :execution="taskExecution"
                :task="data.node.task"
                :color="color"
                :uid="data.node.uid"
                :state="state"
            />

            <template v-if="data.node.task">
                <button v-if="playgroundEnabled && playgroundReadyToStart" type="button" class="playground-button" @click="emit(EVENTS.RUN_TASK, {task: data.node.task})">
                    <tooltip style="display: flex;" :title="$t('run task in playground')">
                        <PlayIcon class="button-play-icon" :alt="$t('run task in playground')" />
                    </tooltip>
                </button>
                <div
                    v-else
                    class="playground-button" 
                    :style="{
                        color: `var(--ks-content-${state?.toLowerCase()})`, 
                        backgroundColor: `var(--ks-background-${state?.toLowerCase()})`
                    }"
                >
                    <tooltip v-if="state === State.RUNNING" style="display: flex;" :title="$t('task is running')">
                        <RotatingDots :alt="$t('task is running')" />
                    </tooltip>
                    <tooltip v-else-if="state === State.SUCCESS" style="display: flex;" :title="$t('task was successful')">
                        <CheckIcon :alt="$t('task was successful')" />
                    </tooltip>
                    <tooltip v-else-if="state === State.WARNING" style="display: flex;" :title="$t('task sent a warning')">
                        <AlertIcon :alt="$t('task sent a warning')" />
                    </tooltip>
                    <tooltip v-else-if="state === State.FAILED" style="display: flex;" :title="$t('task failed')">
                        <AlertCircleIcon :alt="$t('task failed')" />
                    </tooltip>
                </div>
            </template>
        </template>
        <template #badge-button-before>
            <span
                v-if="data.node.task && data.node.task.runIf"
                class="circle-button"
                :class="[`bg-warning`]"
                @click="emit(EVENTS.SHOW_CONDITION, {id: taskId, task: data.node.task, section: SECTIONS.TASKS})"
            >
                <tooltip :title="$t('show task condition')">
                    <SendLock class="button-icon" alt="Show condition" />
                </tooltip>
            </span>
            <span
                v-if="taskExecution"
                class="circle-button"
                :class="[`bg-${color}`]"
                @click="emit(EVENTS.SHOW_LOGS, {id: taskId, execution: taskExecution, taskRuns})"
            >
                <tooltip :title="$t('show task logs')">
                    <TextBoxSearch class="button-icon" alt="Show logs" />
                </tooltip>
            </span>
            <span
                v-if="!taskExecution && !data.isReadOnly && data.isFlowable"
                class="circle-button"
                :class="[`bg-${color}`]"
                @click="emit(EVENTS.ADD_ERROR, {task: data.node.task})"
            >
                <tooltip :title="$t('add error handler')">
                    <AlertOutline class="button-icon" alt="Add error handler" />
                </tooltip>
            </span>
            <span
                v-if="!taskExecution && !data.isReadOnly"
                class="circle-button"
                :class="[`bg-${color}`]"
                @click="emit(EVENTS.EDIT, {task: data.node.task, section: SECTIONS.TASKS})"
            >
                <tooltip :title="$t('edit')">
                    <Pencil class="button-icon" alt="Edit task" />
                </tooltip>
            </span>
            <span
                v-if="!taskExecution && !data.isReadOnly"
                class="circle-button"
                :class="[`bg-${color}`]"
                @click="emit(EVENTS.DELETE, {id: taskId, section: SECTIONS.TASKS})"
            >
                <tooltip :title="$t('delete')">
                    <Delete class="button-icon" alt="Delete task" />
                </tooltip>
            </span>
        </template>
    </basic-node>
    <Handle type="target" :position="targetPosition" />
</template>

<script setup lang="ts">
    import {computed, inject} from "vue";
    import {Handle, Position} from "@vue-flow/core";
    import State from "../../utils/state";
    import {EVENTS, SECTIONS} from "../../utils/constants";
    import ExecutionInformations from "../misc/ExecutionInformations.vue";
    import Tooltip from "../misc/Tooltip.vue";
    import Utils from "../../utils/Utils";
    import BasicNode from "./BasicNode.vue";
    import {
        EXECUTION_INJECTION_KEY,
        SUBFLOWS_EXECUTIONS_INJECTION_KEY,
    } from "../topology/injectionKeys";

    import Pencil from "vue-material-design-icons/Pencil.vue";
    import Delete from "vue-material-design-icons/Delete.vue";
    import TextBoxSearch from "vue-material-design-icons/TextBoxSearch.vue";
    import AlertOutline from "vue-material-design-icons/AlertOutline.vue";
    import SendLock from "vue-material-design-icons/SendLock.vue";
    import PlayIcon from "vue-material-design-icons/Play.vue";
    import CheckIcon from "vue-material-design-icons/Check.vue";
    import AlertCircleIcon from "vue-material-design-icons/AlertCircle.vue";
    import AlertIcon from "vue-material-design-icons/Alert.vue";
    import RotatingDots from "../../assets/icons/RotatingDots.vue";

    // Define types
    interface TaskType {
        id: string;
        type: object;
        default: null;
        runIf?: unknown;
        subflowId?: {
            namespace: string;
            flowId: string;
        };
        namespace?: string;
        flowId?: string;
    }

    interface NodeData {
        node: {
            uid: string;
            type?: string;
            task: TaskType;
        };
        executionId?: string;
        color?: string;
        isReadOnly?: boolean;
        isFlowable?: boolean;
        link?: {
            namespace: string;
            id: string;
            executionId?: string;
        };
    }

    interface TaskRun {
        taskId: string;
        state: {
            current: [string, string]; // [state, stateText]
        };
        outputs?: {
            executionId?: string;
        };
    }

    interface ExpandData {
        id: string;
        type: string;
    }

    const props = withDefaults(defineProps<{
        data: NodeData;
        sourcePosition?: Position;
        targetPosition?: Position;
        id: string;
        icons?: Record<string, unknown>;
        iconComponent?: object;
        enableSubflowInteraction?: boolean;
        playgroundEnabled: boolean;
        playgroundReadyToStart: boolean;
    }>(), {
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
        enableSubflowInteraction: true,
        icons: undefined,
        iconComponent: undefined,
    });

    defineOptions({
        name: "TaskNode",
        inheritAttrs: false
    });

    // Define emits
    const emit = defineEmits<{
        (event: typeof EVENTS.EXPAND, data: any): void;
        (event: typeof EVENTS.OPEN_LINK, data: any): void;
        (event: typeof EVENTS.SHOW_LOGS, data: any): void;
        (event: typeof EVENTS.MOUSE_OVER, data: any): void;
        (event: typeof EVENTS.MOUSE_LEAVE): void;
        (event: typeof EVENTS.ADD_ERROR, data: { task: any }): void;
        (event: typeof EVENTS.EDIT, data: any) :void;
        (event: typeof EVENTS.DELETE, data: any) :void;
        (event: typeof EVENTS.ADD_TASK, data: any) :void;
        (event: typeof EVENTS.SHOW_CONDITION, data: any) :void;
        (event: typeof EVENTS.SHOW_DESCRIPTION, data: any) :void;
        (event: typeof EVENTS.RUN_TASK, data: { task: any }) :void;
    }>();

    // Inject dependencies
    const execution = inject(EXECUTION_INJECTION_KEY);
    const subflowsExecutions = inject(SUBFLOWS_EXECUTIONS_INJECTION_KEY);

    // Computed properties
    const color = computed(() => props.data.color ?? "primary");

    const taskId = computed(() => Utils.afterLastDot(props.id));

    const taskExecution = computed(() => {
        const executionId = props.data.executionId;
        if (executionId) {
            return executionId === execution?.value?.id
                ? execution?.value
                : Object.values(subflowsExecutions?.value || {})
                    .find((exec: any) => exec.id === executionId);
        }
        return undefined;
    });

    const taskRunList = computed(() => {
        return taskExecution.value && taskExecution.value.taskRunList 
            ? taskExecution.value.taskRunList
            : [];
    });

    const taskRuns = computed(() => {
        return taskRunList.value.filter(
            (t: TaskRun) => t.taskId === Utils.afterLastDot(props.data.node.uid)
        );
    });

    const state = computed(() => {
        if (!taskRuns.value?.length) {
            return null;
        }

        if (taskRuns.value.length === 1) {
            return taskRuns.value[0].state.current;
        }

        const allStates = taskRuns.value.map((t: TaskRun) => t.state.current);
        
        // Create a copy of SORT_STATUS array to avoid modifying the original
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

        // Sort states based on priority
        const result = allStates
            .map((item: [string, string]) => {
                const n = SORT_STATUS.indexOf(item[1]);
                // Handle sorting without modifying the original array
                return [n, item] as [number, [string, string]];
            })
            .sort()
            .map((j: [number, [string, string]]) => j[1]);
        
        return result[0];
    });

    const classes = computed(() => ({
        "execution-no-taskrun": 
            Boolean(taskExecution.value && taskRuns.value && taskRuns.value.length === 0)
    }));

    const expandData = computed<ExpandData>(() => ({
        id: props.id,
        type: String(props.data.node.task.type)
    }));

    const dataWithLink = computed(() => {
        if (props.data.node.type?.endsWith("SubflowGraphTask") && props.enableSubflowInteraction) {
            const subflowIdContainer = props.data.node.task.subflowId ?? props.data.node.task;
            return {
                ...props.data,
                link: {
                    namespace: subflowIdContainer.namespace,
                    id: subflowIdContainer.flowId,
                    executionId: taskExecution.value?.taskRunList
                        .filter((taskRun: TaskRun) => 
                            taskRun.taskId === props.data.node.task.id && 
                            taskRun.outputs?.executionId
                        )
                        ?.[0]?.outputs?.executionId
                }
            };
        }
        return props.data;
    });
</script>

<style lang="scss" scoped>
@use "../../scss/_color-palette.scss" as _color-palette;

.playground-button {
    position: absolute;
    bottom: 0;
    right: 0;
    z-index: 1;
    border: none;
    background-color: var(--ks-background-card);
    border-radius: 3px;
    height: 1rem;
    width: 1rem;
    padding: .1rem;
    margin: 6px;
    font-size: .8rem;
}

button.playground-button,
.dark button.playground-button {
    color: _color-palette.$base-white; 
    background-color: _color-palette.$base-blue-400;
}
</style>
