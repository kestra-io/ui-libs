<template>
    <Handle type="source" :position="sourcePosition" />
    <div class="collapsed-cluster-node d-flex">
        <span class="node-text">
            <component v-if="data.iconComponent" :is="data.iconComponent" :class="`text-${data.color} me-2`" />
            {{ Utils.afterLastDot(id) }}
        </span>
        <div class="text-white top-button-div">
            <slot name="badge-button-before" />
            <span
                v-if="expandable"
                class="circle-button"
                :class="[`bg-${data.color}`]"
                @click="$emit(EVENTS.EXPAND, {id})"
            >
                <tooltip :title="Utils.translate('expand')">
                    <ArrowExpand class="button-icon" alt="Expand task" />
                </tooltip>
            </span>
            <slot name="badge-button-after" />
        </div>
    </div>
    <Handle type="target" :position="targetPosition" />
</template>

<script setup>
    import Utils from "../../utils/Utils.js";
</script>

<script>
    import {EVENTS} from "../../utils/constants.js";
    import ArrowExpand from "vue-material-design-icons/ArrowExpand.vue";
    import Webhook from "vue-material-design-icons/Webhook.vue";
    import {Handle} from "@vue-flow/core";
    import Tooltip from "../misc/Tooltip.vue";
    import Utils from "../../utils/Utils.js";

    export default {
        components: {
            Tooltip,
            Handle,
            ArrowExpand,
            Webhook
        },
        inheritAttrs: false,
        props: {
            id: {
                type: String,
                default: undefined
            },
            sourcePosition: {
                type: String,
                required: true
            },
            targetPosition: {
                type: String,
                required: true
            },
            data: {
                type: Object,
                required: true
            },
        },
        data() {
            return {
                filter: undefined,
                isOpen: false,
            };
        },
        computed: {
            EVENTS() {
                return EVENTS
            },
            expandable() {
                return this.data?.expandable || false
            },
            description() {
                const node = this.data.node.task ?? this.data.node.trigger ?? null
                if (node) {
                    return node.description ?? null
                }
                return null
            }
        },
    }
</script>

<style lang="scss" scoped>
    .collapsed-cluster-node {
        width: 150px;
        height: 44px;
        padding: 8px;
    }

    .node-text {
        color: black;
        font-size: 0.90rem;
        display: flex;
        align-items: center;

        html.dark & {
            color: white;
        }
    }

    .circle-button {
        border-radius: 1rem;
        width: 1rem;
        height: 1rem;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .button-icon {
        font-size: 0.75rem;
    }

</style>
