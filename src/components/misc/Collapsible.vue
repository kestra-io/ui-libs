<template>
    <div :id="href" class="d-flex flex-column" :class="{'gap-2': !collapsed}">
        <button
            type="button"
            class="d-flex align-items-center justify-content-between fw-bold gap-2 collapse-button"
            :class="{collapsed}"
            data-toggle="collapse"
            :data-target="getHash"
            aria-expanded="false"
            :aria-controls="href + '-body'"
            @click="handleClick"
        >
            <span class="d-flex gap-2 align-items-center">
                <component v-if="arrow" class="arrow" :is="collapsed ? MenuRight : MenuDown" />{{ clickableText }}
                <slot name="additionalButtonText" />
            </span>
            <span v-if="$slots.buttonRight" class="d-flex flex-grow-1">
                <slot name="buttonRight" :collapsed="collapsed" />
            </span>
        </button>
        <div v-if="$slots.content" :id="href + '-body'" class="collapsible-body" :class="{collapsed}">
            <div>
                <slot name="content" />
            </div>
        </div>
    </div>
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

    const collapsed = ref(!props.initiallyExpanded);

    const route = useRoute();
    const router = useRouter();

    const getHash = computed(() => `#${props.href}-body`);
    const handleClick = () => {
        collapsed.value = !collapsed.value;
        router.replace({hash: collapsed.value ? "" : getHash.value});
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

    watch(
        () => props.initiallyExpanded,
        initiallyExpanded => {
            if (initiallyExpanded) {
                collapsed.value = !initiallyExpanded;
            }
        },
        {immediate: true}
    );
</script>

<style scoped lang="scss">
.collapse-button {
    padding: 0;
    border: none;
    background: none;

    &:focus {
        outline: none;
        box-shadow: none;
    }
}

.collapsible-body {
    display: grid;
    transition: grid-template-rows 150ms;
    grid-template-rows: 1fr;

    &.collapsed {
        grid-template-rows: 0fr;
    }

    >div {
        overflow: hidden;
    }
}
</style>