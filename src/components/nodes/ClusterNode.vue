<template>
    <Handle type="source" :position="sourcePosition"/>
    <span class="badge rounded-pill" :class="[`bg-${data.color}`]">{{ label }}</span>
    <div class="position-absolute top-0 start-100 translate-middle text-white d-flex top-button-div">
        <span
            v-if="data.expandable"
            class="rounded-button"
            :class="[`bg-${data.color}`]"
            @click="collapse()">
                <img src="/arrow-collapse.svg" class="button-icon" alt="Expand task"/>
            </span>
    </div>
    <Handle type="target" :position="targetPosition"/>
</template>
<script setup>
    import {Handle, useVueFlow} from "@vue-flow/core";
    import {EVENTS} from "../../functions/constants.js";

    const props = defineProps(["data", "sourcePosition", "targetPosition", "label", "id"]);
    const emit = defineEmits([EVENTS.COLLAPSE])

    onMounted(() => {
        console.log("cluster setup")
    })

    const collapse = () => {
        emit(EVENTS.COLLAPSE, props.id)
    };

</script>
<script>
    export default {
        inheritAttrs: false,
    }
</script>
<style scoped lang="scss">
    .button-size {
        width: 1rem;
        height: 1rem;

    }

    .rounded-button {
        border-radius: 1rem;
        width: 1rem;
        height: 1rem;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 2px;

    }

    .button-icon {
        width: 0.75rem;
        height: 0.75rem;
    }
</style>