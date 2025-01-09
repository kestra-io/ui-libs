<template>
    <div class="mermaid" v-if="show">
        <slot />
    </div>
</template>

<script setup lang="ts">
    import {nextTick, onMounted, ref} from "vue";

    let show = ref(false);

    onMounted(async () => {
        show.value = true
        const {default: {initialize, run}} = await import("mermaid");
        await initialize({startOnLoad: true})
        await nextTick()
        await run();
    })
</script>