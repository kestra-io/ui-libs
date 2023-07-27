<template>
    <div class="node-wrapper rounded-4 border" :class="[`border-${color}`]">
        <div class="node-wrapper-header">
            <TaskIcon/>
            <div class="task-title">
                <span> {{ id }} </span>
            </div>
            <InformationOutline @click="$emit(EVENTS.GET_DESCRIPTION)" class="description-button"/>
        </div>
        <div class="node-content">
            <slot name="content"/>
        </div>
        <div class="position-absolute top-0 start-100 translate-middle text-white d-flex top-button-div">
            <span
                v-if="data.expandable"
                class="rounded-button"
                :class="[`bg-${color}`]"
                @click="$emit(EVENTS.OPEN_LINK)">
                <img src="/open-in-new.svg" class="button-icon" alt="Open in new tab"/>
            </span>
            <span
                v-if="data.expandable"
                class="rounded-button"
                :class="[`bg-${color}`]"
                @click="$emit(EVENTS.EXPAND)">
                <img src="/arrow-expand.svg" class="button-icon" alt="Expand task"/>
            </span>
        </div>
    </div>
</template>

<script>
    import TaskIcon from "../misc/TaskIcon.vue";
    import InformationOutline from "vue-material-design-icons/InformationOutline.vue";
    import {EVENTS} from "../../functions/constants.js";
    import ArrowExpand from "vue-material-design-icons/ArrowExpand.vue";
    import OpenInNew from "vue-material-design-icons/OpenInNew.vue";

    export default {
        components: {
            ArrowExpand,
            TaskIcon,
            InformationOutline,
            OpenInNew
        },
        inheritAttrs: false,
        props: {
            id: {
                type: String,
                default: undefined
            },
            type: {
                type: String,
                default: undefined
            },
            disabled: {
                type: Boolean,
                default: undefined
            },
            state: {
                type: String,
                default: undefined
            },
            color: {
                type: String,
                default: 'primary'
            },
            data: {
                type: Object,
                required: true
            }
        },
        methods: {},
        data() {
            return {
                filter: undefined,
                isOpen: false,
            };
        },
        computed: {
            EVENTS() {
                return EVENTS
            }
        },
    }
</script>

<style lang="scss" scoped>
    .node-wrapper {
        width: 9rem;
        margin: 0;
        padding: 0.6rem;
        background-color: white;
    }

    .node-wrapper-header {
        display: flex;
        max-width: 10rem;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }

    .node-content {
        display: flex;
        flex-direction: column;
    }

    .node-content > * {
        margin-bottom: 0.25rem;
    }

    .description-button {
        cursor: pointer;
    }

    .material-design-icon.icon-rounded {
        border-radius: 1rem;
        padding: 1px;
    }

    .rounded-button {
        border-radius: 1rem;
        width: 1rem;
        height: 1rem;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 2px;

    }

    .button-icon {
        width: 0.75rem;
        height: 0.75rem;
    }

</style>