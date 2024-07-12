<template>
    <span ref="tooltip" v-bind="$attrs">
        <slot name="default" />
    </span>
    <span class="d-none" ref="tooltipContent">
        <slot name="content">
            {{ title }}
        </slot>
    </span>
</template>
<script>
    // conditional import is required for website not to crash due to
    // bootstrap launching some init upon import that is incompatible with SSR
    let bootstrap;
    if (document) {
        bootstrap = import("bootstrap");
    }

    export default {
        props: {
            title: {
                type: String,
                default: undefined
            },
            placement: {
                type: String,
                default: "top"
            },
        },
        data() {
            return {
                tooltip: undefined
            }
        },
        async mounted() {
            if (document) {
                this.tooltip = new (await bootstrap).Tooltip(this.$refs.tooltip, {
                    trigger: "hover",
                    html: true,
                    placement: this.placement,
                    title: this.$refs.tooltipContent.innerHTML,
                    customClass: "tooltip-custom"
                })
            }
        },
        async beforeUnmount() {
            this.tooltip?.dispose();
        }
    }
</script>

<style lang="scss">
    .tooltip-custom {
        .tooltip-inner {
            max-width: none;
        }
    }
</style>
