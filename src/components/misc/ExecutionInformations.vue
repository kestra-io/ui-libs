<template>
    <div class="btn-group content rounded-1" :class="[`bg-${color}`]" >
        <button type="button" :class="['btn', `btn-${color}`]" class="content-children">12</button>
        <button type="button" :class="['btn', `btn-${color}`]" class="content-children">3s</button>
        <button type="button" :class="['btn', `btn-${color}`]" class="content-children">LOG</button>
    </div>
</template>
<script>
    import Delete from "vue-material-design-icons/Delete.vue";
    import Pencil from "vue-material-design-icons/Pencil.vue";
    import {EVENTS} from "../../functions/constants"

    export default {
        name: "ExecutionInformations",
        computed: {
            EVENTS() {
                return EVENTS
            }
        },
        components: {Pencil, Delete},
        props: {
            color: {
                type: String,
                default: 'primary'
            }
        }

    }
</script>
<style scoped>
    .content {
        display: flex;
        *:not(:first-child)::before {
            content: "";
            position: absolute;
            left: 0;
            top: 50%;
            height: 50%;
            border-left: 1px solid var(--bs-gray-100);
            transform: translateY(-50%);
            z-index: 500;
        }
    }

    .content-children {
        flex-grow: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 1.75rem;
        padding: 0 0.5rem;
        gap: 0.5rem;
        align-self: stretch;
        pointer-events: none;
        cursor: default;
        font-size: 0.6rem;
    }
</style>