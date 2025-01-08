<template>
    <Handle type="source" :position="sourcePosition" />
    <basic-node
        :id="id"
        :data="formattedData"
        :color="color"
        :icons="icons"
        :icon-component="iconComponent"
        @show-description="forwardEvent(EVENTS.SHOW_DESCRIPTION, $event)"
        @expand="forwardEvent(EVENTS.EXPAND, {id})"
    >
        <template #badge-button-before v-if="!data.isReadOnly">
            <span
                v-if="!execution"
                class="circle-button"
                :class="[`bg-${color}`]"
                @click="$emit(EVENTS.EDIT, {task: data.node.triggerDeclaration, section: SECTIONS.TRIGGERS})"
            >
                <tooltip :title="$t('edit')">
                    <Pencil class="button-icon" alt="Edit task" />
                </tooltip>
            </span>
            <span
                v-if="!execution"
                class="circle-button"
                :class="[`bg-${color}`]"
                @click="$emit(EVENTS.DELETE, {id: triggerId, section: SECTIONS.TRIGGERS})"
            >
                <tooltip :title="$t('delete')">
                    <Delete class="button-icon" alt="Delete task" />
                </tooltip>
            </span>
        </template>
    </basic-node>
    <Handle type="target" :position="targetPosition" />
</template>
<script setup>
    import BasicNode from "./BasicNode.vue";
</script>
<script>
    import {Handle} from "@vue-flow/core";
    import {mapState} from "vuex";
    import {EVENTS, SECTIONS} from "../../utils/constants";
    import Pencil from "vue-material-design-icons/Pencil.vue";
    import Delete from "vue-material-design-icons/Delete.vue";
    import Tooltip from "../misc/Tooltip.vue";
    import Utils from "../../utils/Utils";

    export default {
        name: "Task",
        inheritAttrs: false,
        computed: {
            ...mapState("execution", ["execution"]),
            SECTIONS() {
                return SECTIONS
            },
            EVENTS() {
                return EVENTS
            },
            color() {
                return this.data.color ?? "primary"
            },
            formattedData() {
                return {
                    ...this.data,
                    unused: this.data.node?.triggerDeclaration?.disabled || this.data.node?.trigger?.disabled
                }
            },
            triggerId() {
                return Utils.afterLastDot(this.id);
            }
        },
        emits: [
            EVENTS.DELETE,
            EVENTS.EDIT,
            EVENTS.SHOW_DESCRIPTION
        ],
        components: {
            Delete, Pencil, Handle, Tooltip
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
            },
            icons: {
                type: Object,
                default: undefined
            },
            iconComponent: {
                type: Object,
                default: undefined
            }
        },
        methods: {
            forwardEvent(event, payload) {
                this.$emit(event, payload)
            }
        }
    }
</script>
