<template>
    <div class="btn-group content rounded-1 content-children text-truncate">
        <span
            v-if="taskRuns.length > 0"
            class="taskRunCount"
        >{{ taskRuns.length }} task runs</span>
        <span v-if="taskRuns.length > 0"> | </span>
        <span v-if="histories"><duration :histories="histories" /></span>
    </div>
</template>
<script lang="ts" setup>
    import {computed} from "vue";
    import moment from "moment";
    import Duration from "./Duration.vue";
    import State from "../../utils/state";
    import Utils from "../../utils/Utils"

    defineOptions({
        name: "ExecutionInformations",
    });

    const props = defineProps<{
        color?: string;
        uid?: string;
        execution?: {
            taskRunList: any[];
        };
        task: {
            type: object;
            default: null;
        };
    }>();

    const taskRunList = computed(() => {
        return props.execution?.taskRunList ? props.execution.taskRunList : [];
    });
    const taskRuns = computed(() => {
        return taskRunList.value.filter(
            (t) => t.taskId === Utils.afterLastDot(props.uid ?? "")
        );
    });
    const state = computed(() => {
        if (!taskRuns.value) {
            return null;
        }

        if (taskRuns.value.length === 1) {
            return taskRuns.value[0].state.current;
        }

        const allStates = taskRuns.value.map((t) => t.state.current);

        const SORT_STATUS: (string | undefined)[] = [
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
                return [n, item];
            })
            .sort()
            .map((j) => j[1]);

        return result[0];
    });
    const histories = computed(() => {
        if (!taskRuns.value) {
            return undefined;
        }

        const max = Math.max(
            ...taskRuns.value
                .filter(
                    (value) => value.state.histories && value.state.histories.length > 0
                )
                .map((value) =>
                    new Date(
                        value.state.histories[value.state.histories.length - 1].date
                    ).getTime()
                )
        );

        const duration = Math.max(
            ...taskRuns.value.map(
                (taskRun) =>
                    moment.duration(taskRun.state.duration).asMilliseconds() / 1000,
                0
            )
        );

        return [
            {date: moment(max).subtract(duration, "second"), state: "CREATED"},
            {date: moment(max), state: state.value},
        ];
    });
</script>
<style lang="scss" scoped>
.content {
  color: var(--ks-content-secondary);
}

.content-children {
  font-size: 0.7rem;
}
</style>
