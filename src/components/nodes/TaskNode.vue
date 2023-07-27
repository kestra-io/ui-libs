<template>
    <Handle type="source" :position="sourcePosition"/>
    <basic-node
        :data="data"
        :color="color"
        @showDescription="forwardEvent(EVENTS.GET_DESCRIPTION, id)"
        @expand="forwardEvent(EVENTS.EXPAND, id)"
        :id="id">
        <template #content>
            <actions-buttons :color="color" @edit="forwardEvent(EVENTS.EDIT, id)" @delete="forwardEvent(EVENTS.DELETE, id)"/>
            <state :color="color"/>
            <execution-informations :color="color"/>
        </template>
    </basic-node>
    <Handle type="target" :position="targetPosition"/>
</template>

<script>
    import BasicNode from "./BasicNode.vue";
    import {Handle} from "@vue-flow/core";
    import {EVENTS, SECTIONS} from "../../functions/constants.js";
    import ActionsButtons from "../buttons/ActionsButton.vue";
    import ExecutionInformations from "../misc/ExecutionInformations.vue";
    import State from "../misc/State.vue";

    export default {
        name: "Task",
        inheritAttrs: false,
        computed: {
            EVENTS() {
                return EVENTS
            },
            color() {
                return this.data.color ?? 'primary'
            }
        },
        emits: ["mouseover", "mouseleave", "edit", "delete", "addFlowableError", "follow","expand"],
        components: {
            State,
            ExecutionInformations,
            Handle,
            BasicNode,
            ActionsButtons,
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
                type: String
            }
        },
        methods: {
            forwardEvent(event, payload) {
                this.$emit(event, payload)
            }
        }
    }
</script>