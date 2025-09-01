<template>
    <details :id="href" :open>
        <summary
            class="d-flex align-items-center justify-content-between fw-bold gap-2 collapse-button"
            :class="{collapsed}"
            @click="handleToggle"
        >
            <span class="d-flex gap-2 align-items-center">
                <component v-if="arrow" class="arrow" :is="collapsed ? MenuRight : MenuDown" />
                {{ clickableText }}
                <slot name="additionalButtonText" />
            </span>
            <span v-if="$slots.buttonRight" class="d-flex flex-grow-1">
                <slot name="buttonRight" :collapsed="collapsed" />
            </span>
        </summary>
        <div v-if="$slots.content" :id="href + '-body'">
            <div>
                <slot name="content" />
            </div>
        </div>
    </details>
</template>

<script setup lang="ts">
    import {ref, watch, computed} from "vue";
    import MenuRight from "vue-material-design-icons/MenuRight.vue";
    import MenuDown from "vue-material-design-icons/MenuDown.vue";
    import {useRoute} from "vue-router";

    const props = withDefaults(defineProps<{
        href?: string,
        clickableText: string,
        arrow?: boolean,
        initiallyExpanded?: boolean
        noUrlChange?: boolean
    }>(), {
        href: Math.random().toString(36).substring(2, 5),
        arrow: true,
        initiallyExpanded: false,
        noUrlChange: false
    });

    const collapsed = ref(true);

    const route = useRoute();

    const emit = defineEmits(["expand"]);
    const getHash = computed(() => `#${props.href}-body`);
    const handleToggle = (event: Event) => {
        event.preventDefault();
        collapsed.value = !collapsed.value;
        open.value = !collapsed.value;
        if(!collapsed.value) {
            emit("expand");
        }
        if(props.noUrlChange) {
            return;
        }
        window.location.hash = collapsed.value ? "" : getHash.value
    };

    const open = ref(false);

    watch(
        () => props.initiallyExpanded,
        (initiallyExpanded) => {
            if (initiallyExpanded !== undefined) {
                open.value = initiallyExpanded;
                collapsed.value = !initiallyExpanded;
            }
        }
        , {immediate: true});

    watch(
        () => route.hash,
        (hash) => {
            if (hash === getHash.value && collapsed.value) {
                open.value = true;
                collapsed.value = false;
            }
        }
        , {immediate: true});
</script>

<style scoped lang="scss">
    details{
        overflow: hidden;
    }

    details::details-content{
        block-size: 0%;
        transition: block-size 150ms,
        content-visibility 150ms;
        transition-behavior: allow-discrete;
    }

    details[open]::details-content{
        block-size: auto;
    }

    .collapse-button {
        padding: 0;
        border: none;
        background: none;

        &:focus {
            outline: none;
            box-shadow: none;
        }
    }
</style>
