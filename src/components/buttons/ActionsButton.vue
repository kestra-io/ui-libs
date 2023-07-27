<template>
    <div class="btn-group btn-group-sm rounded" :class="[`bg-${color}`]" role="group">
        <button type="button" :class="['btn', `btn-${color}`]" @click="$emit(EVENTS.EDIT)">
            <span class="float-end">
                <Pencil/>
            </span>
        </button>
        <button type="button" :class="['btn', `btn-${color}`]" @click="$emit(EVENTS.DELETE)">
            <span class="float-start">
                <Delete/>
            </span>
        </button>
    </div>
</template>
<script>
    import Delete from "vue-material-design-icons/Delete.vue";
    import Pencil from "vue-material-design-icons/Pencil.vue";
    import {EVENTS} from "../../functions/constants"

    export default {
        name: "ActionsButton",
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
    .btn-group {
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
</style>