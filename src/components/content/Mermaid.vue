<template>
    <div class="mermaid" v-if="show">
        <slot />
    </div>
</template>

<script setup lang="ts">
    import mermaid from "mermaid";
    import {nextTick, onMounted, ref} from "vue";

    let show = ref(false);

    onMounted(async () => {
        show.value = true
        await mermaid.initialize({startOnLoad: true})
        await nextTick()
        await mermaid.init();
    })
</script>