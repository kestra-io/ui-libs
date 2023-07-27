<script>
    import TaskIcon from "../misc/TaskIcon.vue";

    export default {
        name: "AddTaskButton",
        components: {TaskIcon},
        props: {
            addTask: {
                type: Boolean,
                default: false
            },
        }
    }
</script>

<template>
    <TaskIcon :addTask="addTask" />
</template>

<style scoped>

</style>