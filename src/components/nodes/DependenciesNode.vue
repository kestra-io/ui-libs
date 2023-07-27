<template>
    <Handle type="source" :position="sourcePosition" />
    <div v-if="label" class="label" v-html="label" />
    <Handle type="source" :position="targetPosition" />
</template>

<script>
    import {Handle} from "@vue-flow/core";

    export default {
        name: "Dependencies",
        components: {Handle},
    }
</script>

<style scoped>

</style>