<template>
    <div class="add-task-div rounded d-flex justify-content-center align-items-center">
        <Plus v-if="addTask" alt="add task icon" />
    </div>
</template>

<script setup lang="ts">
    import Plus from "vue-material-design-icons/Plus.vue";

    defineOptions({
        name: "AddTaskButton",
    })

    defineProps<{addTask?: boolean}>()
</script>

<style scoped lang="scss">
    @import "../../scss/variables";

    .add-task-div {
        margin: 0.2rem;
        width: 25px;
        height: 25px;
        border: 0.4px solid var(--ks-border-primary);
        background-color: var(--ks-background-card);
        cursor: pointer;

        &.text-danger {
            border-color: $red;
        }
    }
</style>