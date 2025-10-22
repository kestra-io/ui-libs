<template>
    <details open class="row-link" data-bs-toggle="dropdown" @click="setSubOptions">
        <summary class="d-flex flex-grow-1 align-items-center gap-7 rounded">
            <img :src="iconB64Svg" :alt="`${text} icon`"> 
            {{ text }}
        </summary>
    </details>
    <ul class="list-actions" v-show="subOptions">
        <li class="list-group pb-2" v-for="(action) in element" :key="action">
            <a class="dropdown-item row-link d-flex flex-grow-1 align-items-center gap-7 rounded" :href="action">
                {{ action.split(".")[5] }}
            </a>
        </li>
    </ul>
</template>
<script setup lang="ts">
    import {onMounted} from "vue";
    import {ref} from "vue";

    const props = defineProps<{ 
        iconB64Svg: string, 
        text: string, 
        routePath: string,
        href?: string | undefined,
        element: string[] 
    }>();

    onMounted(()=>{
        console.log("props-elem---",props.element)
    })

    const subOptions = ref(false);
    const setSubOptions = ()=>{
        subOptions.value = !subOptions.value
    }
    // const hrefWithDefault = computed(() => props.href === undefined ? `${props.routePath}/${slugify(props.text)}` : props.href);
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