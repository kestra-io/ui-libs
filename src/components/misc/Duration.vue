<template>
    <tooltip>
        <template #content>
            <span v-for="(history, index) in filteredHistories" :key="'tt-' + index" class="duration-tt">
                <span class="square" :class="squareClass(history.state)" />
                <strong>{{ history.state }}: </strong>{{ $filters.date(history.date, 'iso') }} <br>
            </span>
        </template>

        <template #default>
            <span v-html="duration" />
        </template>
    </tooltip>
</template>

<script>
    import State from "../../utils/state";
    import Utils from "../../utils/Utils";
    import Tooltip from "../misc/Tooltip.vue";

    const ts = date => new Date(date).getTime();

    export default {
        components: {Tooltip},
        props: {
            histories: {
                type: Array,
                default: undefined
            }
        },
        watch: {
            histories(newValue, oldValue) {
                if (oldValue[0].date !== newValue[0].date) {
                    this.paint()
                }
            },
        },
        data () {
            return {
                duration: "",
                refreshHandler: undefined
            }
        },
        mounted() {
            this.paint()
        },
        computed: {
            start() {
                return this.histories && this.histories.length && ts(this.histories[0].date);
            },
            lastStep() {
                return this.histories[this.histories.length - 1]
            },
            filteredHistories() {
                return this.histories.filter(h => h.date && h.date.isValid() && h.state)
            }
        },
        methods: {
            paint() {
                if (!this.refreshHandler) {
                    this.refreshHandler = setInterval(() => {
                        this.computeDuration()
                        if (this.histories && !State.isRunning(this.lastStep.state)) {
                            this.cancel();
                        }
                    }, 100);
                }
            },
            cancel() {
                if (this.refreshHandler) {
                    clearInterval(this.refreshHandler);
                    this.refreshHandler = undefined
                }
            },
            delta() {
                return this.stop() - this.start;
            },
            stop() {
                if (!this.histories || State.isRunning(this.lastStep.state)) {
                    return +new Date();
                }
                return ts(this.lastStep.date)
            },
            computeDuration() {
                this.duration = this.filteredHistories.length === 0 ? "&nbsp;" : Utils.humanDuration(this.delta() / 1000)
            },
            squareClass(state) {
                return [
                    "bg-" + State.colorClass()[state]
                ]
            }
        },
        beforeUnmount() {
            this.cancel();
        }
    }
</script>

<style lang="scss">
    .duration-tt {
        text-align: left;
        white-space: nowrap;
        max-width: none;

        .square {
            display: inline-block;
            width: 10px;
            height: 10px;
            margin-right: 5px;
        }
    }
</style>
