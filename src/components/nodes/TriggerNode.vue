<template>
    <Handle type="source" :position="sourcePosition" />
    <Handle type="target" :position="targetPosition" />
</template>

<script>
    import TreeNode from "./BasicNode.vue";
    import {Handle} from "@vue-flow/core";
    export default {
        name: "Trigger",
        emits: ["mouseover", "mouseleave", "edit", "delete"],
        components: {
            Handle,
            TreeNode
        }
    }
</script>

<style scoped>

</style>