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
    import * as Utils from "../../utils/Utils"

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
        state: string;
    }>();

    const taskRunList = computed(() => {
        return props.execution?.taskRunList ? props.execution.taskRunList : [];
    });

    const taskRuns = computed(() => {
        return taskRunList.value.filter(
            (t) => t.taskId === Utils.afterLastDot(props.uid ?? "")
        );
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
            {date: moment(max), state: props.state},
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
