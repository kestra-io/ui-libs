<template>
    <tooltip :key="lastStep.date.toString()">
        <template #content>
            <span
                v-for="(history, index) in filteredHistories"
                :key="'tt-' + index"
                class="ks-duration-tt"
            >
                <span class="ks-duration-tt-square" :class="squareClass(history.state)" />
                <strong>{{ history.state }}: </strong>{{ Utils.dateFilter(history.date.toISOString(), "iso") }} <br>
            </span>
        </template>
        
        <template #default>
            <span v-html="duration" />
        </template>
    </tooltip>
</template>

<script setup lang="ts">
    import {computed, onBeforeUnmount, onMounted, ref, watch} from "vue";
    import {type Moment} from "moment";
    import State from "../../utils/state";
    import * as Utils from "../../utils/Utils";
    import Tooltip from "./Tooltip.vue";

    const props = defineProps<{
        histories: {
            date: Moment;
            state: string
        }[];
    }>();

    watch(
        () => props.histories,
        (newValue, oldValue) => {
            if (oldValue[0].date !== newValue[0].date) {
                paint();
            }
        }
    );

    const duration = ref("");
    const refreshHandler = ref();

    onMounted(() => {
        paint();
    });

    const start = computed(() => {
        return props.histories?.length && new Date(props.histories[0].date.toString()).getTime();
    });

    const lastStep = computed(() => {
        return props.histories[props.histories.length - 1];
    });

    const filteredHistories = computed(() => {
        return props.histories.filter((h) => h.date.isValid() && h.date && h.state);
    });

    function paint() {
        if (!refreshHandler.value) {
            refreshHandler.value = setInterval(() => {
                computeDuration();
                if (props.histories && !State.isRunning(lastStep.value.state)) {
                    cancel();
                }
            }, 100);
        }
    }

    function cancel() {
        if (refreshHandler.value) {
            clearInterval(refreshHandler.value);
            refreshHandler.value = undefined;
        }
    }

    function delta() {
        return stop() - start.value;
    }

    function stop() {
        if (!props.histories || State.isRunning(lastStep.value.state)) {
            return +new Date();
        }
        return new Date(lastStep.value.date.toString()).getTime();
    }

    function computeDuration() {
        duration.value =
            filteredHistories.value.length === 0
                ? "&nbsp;"
                : Utils.humanDuration(delta() / 1000);
    }

    function squareClass(state: string) {
        const remappedState = state.toLowerCase();
        return "ks-duration-tt-square-" + remappedState;
    }

    onBeforeUnmount(() => {
        cancel();
    });
</script>

<style lang="scss">
@use "../../scss/variables.scss" as global-var;
.ks-duration-tt {
  text-align: left;
  white-space: nowrap;
  max-width: none;

  .ks-duration-tt-square {
    display: inline-block;
    width: 10px;
    height: 10px;
    margin-right: 5px;
  }

  @each $value in global-var.$statusList {
    .ks-duration-tt-square-#{$value} {
        background-color: var(--ks-chart-#{$value});
    }
  }
}
</style>
