<template>
    <div class="mb-4">
        <div class="show-button" @click="toggleShow">
            <ChevronDown v-if="show" class="icon-2x" />
            <ChevronRight v-else class="icon-2x" />
            <span v-if="title" class="title">{{ title }}</span>
        </div>
    </div>
    <div v-if="show">
        <slot />
    </div>
</template>

<script setup lang="ts">
    import { ref } from "vue"
    import ChevronDown from "vue-material-design-icons/ChevronDown.vue"
    import ChevronRight from "vue-material-design-icons/ChevronRight.vue"

    defineProps<{
        title: string
    }>()

    const show = ref(false)


    const toggleShow = () => {
        show.value = !show.value
    }
</script>

<style lang="scss" scoped>
    @import "../../scss/variables";

    .show-button {
        cursor: pointer;
        font-size: 1.30em;
        color: var(--bs-white);
        display: inline-block;
        padding-right: 0.1em;
    }

    .show-button:hover {
        color: $purple-36;
        background-color: #252526;
        border-radius: 4px;
    }

    .title {
        margin-left: 0.25em;
    }

</style>

