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
    import {Tooltip} from "bootstrap";

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
        mounted() {
            new Tooltip(this.$refs.tooltip, {
                trigger: "hover",
                html: true,
                placement: this.placement,
                title: this.$refs.tooltipContent.innerHTML,
                customClass: "tooltip-custom"
            })
        },
        beforeUnmount() {
            if (this.$refs.tooltip) {
                const tooltip = Tooltip.getInstance(this.$refs.tooltip);
                if (tooltip) {
                    tooltip.dispose();
                }
            }
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
