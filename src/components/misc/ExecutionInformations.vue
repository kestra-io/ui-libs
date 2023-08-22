<template>
    <div class="btn-group content rounded-1 content-children">
        <span v-if="taskRuns.length > 0">{{ taskRuns.length }} task runs</span>
        <span><duration :histories="histories" /></span>
    </div>
</template>
<script>
    import {EVENTS} from "../../utils/constants"
    import moment from "moment";
    import Duration from "./Duration.vue";
    import State from "../../utils/state.js";

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
                return this.taskRunList.filter(t => t.taskId === this.task.id)
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
            }
        }

    }
</script>
<style scoped>
    .content {
        display: flex;

        *:not(:first-child)::before {
            content: "";
            position: absolute;
            left: 0;
            top: 50%;
            height: 50%;
            border-left: 1px solid var(--bs-gray-100);
            transform: translateY(-50%);
            z-index: 500;
        }
    }

    .content-children {
        flex-grow: 1;
        display: flex;
        height: 1.25rem;
        gap: 0.5rem;
        align-self: stretch;
        pointer-events: none;
        cursor: default;
        font-size: 0.75rem;
    }
</style>