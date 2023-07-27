<script>
    import {defineComponent} from 'vue'

    export default defineComponent({
        name: "ControlsCustom"
    })
</script>

<template>
    <Controls :show-interactive="false">
        <ControlButton @click="toggleOrientation" v-if="['topology'].includes(viewType)">
            <SplitCellsVertical :size="48" v-if="!isHorizontal" />
            <SplitCellsHorizontal v-if="isHorizontal" />
        </ControlButton>
    </Controls>
</template>

<style scoped>

</style>