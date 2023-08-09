<script>
    import Plus from "vue-material-design-icons/Plus.vue";

    export default {
        name: "AddTaskButton",
        components: {Plus},
        props: {
            addTask: {
                type: Boolean,
                default: false
            },
        }
    }
</script>

<template>
    <div class="add-task-div rounded d-flex justify-content-center align-items-center">
        <Plus v-if="addTask" alt="add task icon" />
    </div>
</template>

<style scoped lang="scss">
    .add-task-div {
        margin: 0.2rem;
        width: 25px;
        height: 25px;
        border: 0.4px solid var(--bs-border-color);
        background-color: var(--bs-white);
        html.dark & {
            background-color: var(--card-bg);
        }
    }
</style>