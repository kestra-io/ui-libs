<template>
    <div :class="'doc-alert alert alert-' + type" role="alert">
        <div class="me-3">
            <component :is="Icon" class="alert-icon" />
        </div>
        <div class="d-flex flex-column">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
    import {computed} from "vue";
    import FileDocument from "vue-material-design-icons/FileDocument.vue";
    import Information from "vue-material-design-icons/AlertCircle.vue";
    import Warning from "vue-material-design-icons/Alert.vue";
    import Close from "vue-material-design-icons/CloseCircle.vue";

    const props = defineProps<{
        type: "info" | "warning" | "danger" | "success"
    }>();

    defineOptions({
        name: "Alert",
    });

    const Icon = computed(() => {
        switch (props.type) {
        case "success":
            return FileDocument;
        case "info":
            return Information;
        case "warning":
            return Warning;
        case "danger":
            return Close;
        default:
            return Information;
        }
    });
</script>

<style lang="scss" scoped>
    .doc-alert {
        display: flex;
        align-items: start;
        border: 1px solid;
        border-left-width: 5px !important;
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: 0.25rem;

        > * {
            margin: 0;
        }

        .alert-icon {
            font-size: 22px;
        }

        &.alert-danger {
            border-color: var(--ks-border-error);
            color: var(--ks-content-error);
            background-color: var(--ks-background-error);
        }

        &.alert-warning {
            border-color: var(--ks-border-warning);
            color: var(--ks-content-warning);
            background-color: var(--ks-background-warning);
        }

        &.alert-info {
            border-color: var(--ks-border-info);
            color: var(--ks-content-info);
            background-color: var(--ks-background-info);
        }

        &.alert-success {
            border-color: var(--ks-border-success);
            color: var(--ks-content-success);
            background-color: var(--ks-background-success);
        }
    }
</style>
