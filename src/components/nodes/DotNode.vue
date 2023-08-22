<template>
    <Handle type="source" class="custom-handle" :position="sourcePosition" />
    <div class="dot">
        <Circle class="circle" alt="circle" />
    </div>
    <Handle type="target" class="custom-handle" :position="targetPosition" />
</template>

<script>
    import {Handle} from "@vue-flow/core";
    import Circle from "vue-material-design-icons/Circle.vue"

    export default {
        name: "Dot",
        components: {Handle, Circle},
        inheritAttrs: false,
        props: {
            data: {
                type: Object,
                required: true,
            },
            sourcePosition: {
                type: String,
                required: true
            },
            targetPosition: {
                type: String,
                required: true
            },
            label: {
                type: String
            }
        },
    }
</script>
<style scoped>
    .custom-handle {
        visibility: hidden
    }

    .dot {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 5px;
    }
</style>
