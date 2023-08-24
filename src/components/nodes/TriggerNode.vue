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
                v-if="!execution && !data.isReadOnly"
                class="rounded-button"
                :class="[`bg-${color}`]"
                @click="$emit(EVENTS.EDIT, {task: data.node.trigger, section: SECTIONS.TRIGGERS})"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                :title="$t('edit')"
            >
                <Pencil class="button-icon" alt="Edit task" />
            </span>
            <span
                v-if="!execution && !data.isReadOnly"
                class="rounded-button"
                :class="[`bg-${color}`]"
                @click="$emit(EVENTS.DELETE, {id, section: SECTIONS.TRIGGERS})"
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                :title="$t('delete')"
            >
                <Delete class="button-icon" alt="Delete task" />
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
    import {EVENTS, SECTIONS} from "../../utils/constants.js";
    import Pencil from "vue-material-design-icons/Pencil.vue";
    import Delete from "vue-material-design-icons/Delete.vue";
    import {Tooltip} from "bootstrap";

    export default {
        name: "Task",
        inheritAttrs: false,
        mounted(){
            const tooltipTriggerList = [].slice.call(document.querySelectorAll("[data-bs-toggle=\"tooltip\"]"));
            this.tooltips = tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new Tooltip(tooltipTriggerEl, {
                    trigger : "hover"
                })
            })
        },
        beforeUnmount() {
            document.querySelectorAll("[data-bs-toggle=\"tooltip\"]").forEach((el) => {
                const tooltip = Tooltip.getInstance(el);
                if (tooltip) {
                    tooltip.dispose();
                }
            });
        },
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
            }
        },
        emits: [
            EVENTS.DELETE,
            EVENTS.EDIT
        ],
        components: {
            Delete, Pencil,
            Handle,
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