<template>
    <Handle type="source" class="custom-handle" :position="sourcePosition"/>
    <div class="dot">
        <img src="/circle.svg" class="circle" alt="circle"/>
        <span>{{ id }}</span>
    </div>
    <Handle type="target" class="custom-handle" :position="targetPosition"/>
</template>

<script>
    import {Handle} from "@vue-flow/core";

    export default {
        name: "Dot",
        components: {Handle},
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
            id: {
                type: String
            }
        },
    }
</script>
<style scoped>
    .custom-handle {
        visibility: hidden
    }
    .circle {
        max-width: 0.55rem;
        max-height: 0.55rem;
    }
    .dot {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 1.5rem;
    }
</style>