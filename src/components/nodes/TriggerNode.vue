<template>
    <Handle type="source" :position="sourcePosition" />
    <basic-node
        :id="id"
        :data="data"
        :color="color"
        @showDescription="forwardEvent(EVENTS.SHOW_DESCRIPTION, id)"
        @expand="forwardEvent(EVENTS.EXPAND, id)"
    >
        <template #badge-button-before>
            <span
                v-if="!data.execution && !data.isReadOnly"
                class="rounded-button"
                :class="[`bg-${color}`]"
                @click="$emit(EVENTS.EDIT, {task: data.node.trigger, section: SECTIONS.TRIGGERS})"
            >
                <Pencil class="button-icon" alt="Edit task" />
            </span>
            <span
                v-if="!data.execution && !data.isReadOnly"
                class="rounded-button"
                :class="[`bg-${color}`]"
                @click="$emit(EVENTS.DELETE, {id, section: SECTIONS.TRIGGERS})"
            >
                <Delete class="button-icon" alt="Delete task" />
            </span>
        </template>
    </basic-node>
    <Handle type="target" :position="targetPosition" />
</template>

<script>
    import BasicNode from "./BasicNode.vue";
    import {Handle} from "@vue-flow/core";
    import {EVENTS, SECTIONS} from "../../utils/constants.js";
    import Pencil from "vue-material-design-icons/Pencil.vue";
    import Delete from "vue-material-design-icons/Delete.vue";

    export default {
        name: "Task",
        inheritAttrs: false,
        computed: {
            SECTIONS() {
                return SECTIONS
            },
            EVENTS() {
                return EVENTS
            },
            color() {
                return this.data.color ?? "primary"
            }
        },
        emits: [
            EVENTS.DELETE,
            EVENTS.EDIT
        ],
        components: {
            Delete, Pencil,
            Handle,
            BasicNode,
        },
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
                type: String,
                required: true
            }
        },
        methods: {
            forwardEvent(event, payload) {
                this.$emit(event, payload)
            }
        }
    }
</script>
<style scoped lang="scss">
    .rounded-button {
        border-radius: 1rem;
        width: 1rem;
        height: 1rem;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-left: 0.25rem;
    }

    .button-icon {
        font-size: 0.75rem;
    }
</style>