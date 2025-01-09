<template>
    <tooltip :key="lastStep.date">
        <template #content>
            <span
                v-for="(history, index) in filteredHistories"
                :key="'tt-' + index"
                class="duration-tt"
            >
                <span class="square" :class="squareClass(history.state)" />
                <strong>{{ history.state }}: </strong>{{ Utils.dateFilter(history.date, "iso") }} <br>
            </span>
        </template>

        <template #default>
            <span v-html="duration" />
        </template>
    </tooltip>
</template>

<script setup lang="ts">
    import {computed, onBeforeUnmount, onMounted, ref, watch} from "vue";
    import State from "../../utils/state";
    import Utils from "../../utils/Utils";
    import Tooltip from "./Tooltip.vue";

    const props = defineProps<{
        histories: {date: string & {
            isValid: () => boolean
        }; state: string}[];
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
        return props.histories?.length && new Date(props.histories[0].date).getTime();
    });
    const lastStep = computed(() => {
        return props.histories[props.histories.length - 1];
    });
    const filteredHistories = computed(() => {
        return props.histories.filter((h) => h.date && h.state);
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
        return new Date(lastStep.value.date).getTime();
    }
    function computeDuration() {
        duration.value =
            filteredHistories.value.length === 0
                ? "&nbsp;"
                : Utils.humanDuration(delta() / 1000);
    }
    function squareClass(state: string) {
        return ["bg-" + State.colorClass()[state]];
    }

    onBeforeUnmount(() => {
        cancel();
    });
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
