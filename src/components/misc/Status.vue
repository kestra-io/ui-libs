<template>
    <button
        type="button"
        :class="classes"
    >
        <component
            v-if="icon"
            :is="icons"
            class="icon"
        />
        <span class="text">{{ text }}</span>
    </button>
</template>

<script setup lang="ts">
    import {computed} from "vue";
    import State from "../../utils/state";

    const props = withDefaults(defineProps<{
        status: string;
        title?: string;
        icon?: boolean;
        size?: "large" | "default" | "small";
    }>(), {
        icon: false,
        size: "default",
        title: undefined,
    });

    const icons = computed(() => {
        return props.icon 
            ? State.icon()[props.status?.toUpperCase()] 
            : undefined;
    });

    const text = computed(() => {
        return props.title ?? props.status;
    });

    const classes = computed(() => [
        "status-button",
        props.status?.toLowerCase() && `status-button--${props.status.toLowerCase()}`,
        props.size !== "default" && `status-button--${props.size}`
    ].filter(Boolean));

</script>

<style scoped lang="scss">
@import "../../scss/variables.scss";

.status-button {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    line-height: 1;
    white-space: nowrap;
    cursor: default;
    text-align: center;
    box-sizing: border-box;
    outline: none;
    margin: 0;
    transition: 0.1s;
    font-weight: 500;
    user-select: none;
    vertical-align: middle;
    appearance: none;
    border: 1px solid transparent;
    border-radius: 0.25rem;
    font-family: inherit;
    height: 2rem;
    padding: 0.5rem 0.9375rem;
    font-size: 0.875rem;
    min-width: 7rem;

    .icon {
        margin-right: 0.375rem;
        display: inline-flex;
        align-items: center;
        font-size: 1.10rem;
    }

    .text {
        display: inline-flex;
        align-items: center;
        text-transform: uppercase;
    }

    &::-moz-focus-inner {
        border: 0;
    }

    &.status-button--large {
        height: 2.5rem;
        padding: 0.75rem 1.1875rem;
        font-size: 0.875rem;

        .icon {
            margin-right: 0.5rem;
        }
    }

    &.status-button--small {
        height: 1.5rem;
        padding: 0.3125rem 0.6875rem;
        font-size: 0.75rem;

        .icon {
            margin-right: 0.25rem;
        }
    }
}

@each $status in $statusList {
    .status-button--#{$status} {
        color: var(--ks-content-#{$status});
        border-color: var(--ks-border-#{$status});
        background-color: var(--ks-background-#{$status});
    }
}
</style>
