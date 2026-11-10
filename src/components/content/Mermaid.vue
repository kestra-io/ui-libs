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
        // mermaid 12 defaults to the ELK layout and the neo look: keep the mermaid 11 rendering
        await initialize({startOnLoad: true, layout: "dagre", theme: "default", look: "classic"})
        await nextTick()
        await run();
    })
</script>