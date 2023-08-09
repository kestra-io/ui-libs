<script>
    import AlertOctagonOutline from "vue-material-design-icons/AlertOctagonOutline.vue";
    import Check from "vue-material-design-icons/Check.vue";

    export default {
        name: "State",
        props: {
            color: {
                type: String,
                default: "primary"
            }
        },
        computed: {
            stateIcon() {
                switch (this.color) {
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
            },
            stateText() {
                switch (this.color) {
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
            },
        },
    }
</script>

<template>
    <div :class="[`text-${color}`]">
        <component class="icon" :is="stateIcon" fill-color="#ff0000" />
        <span>{{ stateText }}</span>
    </div>
</template>

<style scoped>
    .icon {
        margin-right: 0.3rem;
    }
</style>