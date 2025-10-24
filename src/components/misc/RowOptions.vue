<template>
    <template v-if="!isSubWrapper">
        <details open class="row-link" data-bs-toggle="dropdown" @click="setSubOptions">
            <summary class="d-flex flex-grow-1 align-items-center gap-7 rounded">
                <img :src="iconB64Svg" :alt="`${text} icon`"> 
                {{ text }}
            </summary>
        </details>
        <ul class="list-actions" v-show="subOptions">
            <li class="list-group pb-2" v-for="(action) in element" :key="action">
                <a class="dropdown-item row-link d-flex flex-grow-1 align-items-center gap-7 rounded" :href="action">
                    {{ getActionName(action) }}
                </a>
            </li>
        </ul>
    </template>
    <template v-else>
        <a :href="hrefWithDefault" class="row-link d-flex flex-grow-1 align-items-center gap-7 rounded">
            <img :src="iconB64Svg" :alt="`${text} icon`">{{ text }}
        </a>
    </template>
</template>
<script setup lang="ts">
    import {ref,computed} from "vue";

    const props = defineProps<{ 
        iconB64Svg: string, 
        text: string, 
        routePath: string,
        href?: string | undefined,
        isSubWrapper: boolean,
        element: string[] 
    }>();

    const subOptions = ref(false);
    const setSubOptions = ()=>{
        subOptions.value = !subOptions.value
    }

    const hrefWithDefault = computed(() => props.href === undefined ? `${props.routePath}/${slugify(props.text)}` : props.href);

    const getActionName = (action):string =>{
        const parts = action.split(".")
        return parts[parts.length - 1]
    }

</script>
<style lang="scss" scoped>
    .row-link {
        border-width: 1px;
    }

    summary{
        list-style: none;
        max-width: 100%;
    }

    .list-actions{
        position: relative;
    }
</style>