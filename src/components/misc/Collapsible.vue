<template>
    <details :id="href" @click="handleToggle" :open>
        <summary
            class="d-flex align-items-center justify-content-between fw-bold gap-2 collapse-button"
            :class="{collapsed}"
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
    import {useRoute, useRouter} from "vue-router";

    const props = withDefaults(defineProps<{
        href?: string,
        clickableText: string,
        arrow?: boolean,
        initiallyExpanded?: boolean
    }>(), {
        href: Math.random().toString(36).substring(2, 5),
        arrow: true,
        initiallyExpanded: false
    });

    const collapsed = ref(true);

    const route = useRoute();
    const router = useRouter();

    const getHash = computed(() => `#${props.href}-body`);
    const handleToggle = () => {
        collapsed.value = !collapsed.value;
        router.replace({
            hash: collapsed.value ? "" : getHash.value
        });
    };

    const emit = defineEmits(["expand"]);

    watch(
        () => {
            return route.hash;
        },
        routeHash => {
            if (routeHash === getHash.value) {
                collapsed.value = false;
                emit("expand");
            }
        },
        {immediate: true}
    );

    const open = computed(() => {
        return props.initiallyExpanded || route.hash === getHash.value;
    });

    watch(
        () => props.initiallyExpanded,
        initiallyExpanded => {
            if (initiallyExpanded !== undefined) {
                collapsed.value = !initiallyExpanded;
            }
        }
        , {immediate: true}
    );
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