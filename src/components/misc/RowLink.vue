<template>
    <a class="row-link d-flex flex-grow-1 align-items-center gap-7 rounded" data-bs-toggle="dropdown" @click="showActions">
        <img :src="iconB64Svg" :alt="`${text} icon`">{{ text }}
        <ChevronDown v-if="actionsVisible" class="ms-auto" />
        <ChevronRight v-else class="ms-auto" />
    </a>
    <ul v-if="actionsVisible">
        <li class="list-group pb-2" v-for="(action) in isActions" :key="action">
            <a class="dropdown-item row-link d-flex flex-grow-1 align-items-center gap-7 rounded" :href="action">
                {{ action.split(".")[4] }}
            </a>
        </li>
    </ul>
</template>
<script setup lang="ts">
    import ChevronRight from "vue-material-design-icons/ChevronRight.vue";
    import ChevronDown from "vue-material-design-icons/ChevronDown.vue";

    import {useRoute} from "vue-router";

    const props = defineProps<{ iconB64Svg: string, isActions:object ,text: string, href?: string | undefined }>();

    const {path} = useRoute();
    const actionsVisible = ref(false);

    function showActions (){
        actionsVisible.value = !actionsVisible.value
    }

</script>
<style lang="scss" scoped>
    .row-link {
        border-width: 1px;
    }
</style>