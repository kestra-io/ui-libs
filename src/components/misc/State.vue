<template>
    <div :class="[`text-${color}`]">
        <component class="icon" :is="stateIcon" fill-color="#ff0000" />
        <span>{{ stateText }}</span>
    </div>
</template>

<script setup lang="ts">
    import {computed} from "vue";
    import AlertOctagonOutline from "vue-material-design-icons/AlertOctagonOutline.vue";
    import Check from "vue-material-design-icons/Check.vue";

    defineOptions({
        name: "State"
    })

    const props = withDefaults(
        defineProps<{
            color?: "primary" | "danger" | "success" | "warning"
        }>(), {
            color: "primary"
        })

    const stateIcon = computed(() => {
        switch (props.color) {
        case "primary":
            return AlertOctagonOutline
        case "danger":
            return AlertOctagonOutline
        case "success":
            return Check
        case "warning":
            return AlertOctagonOutline
        default:
            return AlertOctagonOutline
        }
    })
    const stateText = computed(() => {
        switch (props.color) {
        case "primary":
            return "Running"
        case "danger":
            return "Failed"
        case "success":
            return "Success"
        case "warning":
            return "Warning"
        default:
            return "Error"
        }
    })
    
</script>

<style scoped>
    .icon {
        margin-right: 0.3rem;
    }
</style>