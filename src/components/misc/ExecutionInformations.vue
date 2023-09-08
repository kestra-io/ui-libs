<template>
    <div class="btn-group content rounded-1 content-children text-truncate">
        <span v-if="taskRuns.length > 0" class="taskRunCount">{{ taskRuns.length }} task runs</span>
        <span v-if="taskRuns.length > 0"> | </span>
        <span><duration :histories="histories" /></span>
    </div>
</template>
<script>
    import {EVENTS} from "../../utils/constants"
    import moment from "moment";
    import Duration from "./Duration.vue";
    import State from "../../utils/state.js";
    import Utils from "../../utils/Utils.js";

    export default {
        name: "ExecutionInformations",
        computed: {
            EVENTS() {
                return EVENTS
            },
            taskRunList() {
                return this.execution && this.execution.taskRunList ? this.execution.taskRunList : []
            },
            taskRuns() {
                return this.taskRunList.filter(t => t.taskId === Utils.afterLastDot(this.task.id))
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
            histories() {
                if (!this.taskRuns) {
                    return undefined;
                }

                const max = Math.max(...this.taskRuns
                    .filter(value => value.state.histories && value.state.histories.length > 0)
                    .map(value => new Date(value.state.histories[value.state.histories.length - 1].date).getTime()));

                const duration = Math.max(...this.taskRuns
                    .map((taskRun) => moment.duration(taskRun.state.duration).asMilliseconds() / 1000, 0));

                return [
                    {date: moment(max).subtract(duration, "second"), state: "CREATED"},
                    {date: moment(max), state: this.state}
                ]
            },
        },
        components: {Duration},
        props: {
            color: {
                type: String,
                default: "primary"
            },
            execution: {
                type: Object,
                default: null
            },
            task: {
                type: Object,
                default: null
            }
        }
    }
</script>
<style scoped>
    .content {
        color: var(--bs-gray-700);
    }

    .content-children {
        font-size: 0.70rem;
    }
</style>
