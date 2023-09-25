<template>
    <div :class="classes">
        <Handle type="source" class="custom-handle" :position="sourcePosition" />
        <div class="dot">
            <CircleIcon :class="{'text-danger': data.node.error}" class="circle" alt="circle" />
        </div>
        <Handle type="target" class="custom-handle" :position="targetPosition" />
    </div>
</template>

<script>
    import {Handle} from "@vue-flow/core";
    import CircleIcon from "vue-material-design-icons/Circle.vue"

    export default {
        name: "Dot",
        components: {Handle, CircleIcon},
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
        computed: {
            classes() {
                return {"unused-path": this.data.unused};
            }
        }
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
