<template>
    <TaskIcon v-if="icons" v-bind="$attrs" :icons="icons" />
</template>

<script setup>
    import TaskIcon from "../../../src/components/misc/TaskIcon.vue";
    import {onMounted, ref} from "vue";

    defineOptions({
        inheritAttrs: false
    })

    const icons = ref(undefined);

    onMounted(async () => {
        icons.value = await (await fetch("https://api.kestra.io/v1/plugins/icons")).json()
    });
</script>
