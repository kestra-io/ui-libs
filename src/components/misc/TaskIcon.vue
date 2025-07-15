<template>
    <div
        v-if="imageBase64"
        :class="classes"
        class="wrapper"
    >
        <Tooltip v-if="!onlyIcon" :title="cls">
            <div class="icon" :style="styles" />
        </Tooltip>

        <div v-else class="icon" :style="styles" />
    </div>
</template>

<script setup lang="ts">
    import {computed} from "vue";
    import Tooltip from "../misc/Tooltip.vue";
    import {cssVariable} from "../../utils/global";

    defineOptions({
        name: "TaskIcon",
    })

    const props = defineProps<{
        customIcon?: {icon:string, };
        cls?:string;
        theme?: "dark" | "light";
        icons?: any;
        onlyIcon?: boolean;
        variable?: string;
    }>()

    const classes = computed(() => {
        return {
            "flowable": icon.value ? icon.value.flowable : false,
        }
    })

    const styles = computed(() => {
        return {
            backgroundImage: `url(data:image/svg+xml;base64,${imageBase64.value})`
        }
    })

    const imageBase64 = computed(() => {
        let localIcon = icon.value && icon.value.icon ? window.atob(icon.value.icon) : undefined;

        if (!localIcon) {
            return false;
        }

        const darkTheme = document.getElementsByTagName("html")[0].className.indexOf("dark") >= 0;
        let color = (darkTheme ? cssVariable("--bs-gray-900") : cssVariable("--bs-black")) ?? "#FFFFFF";

        if (props.theme) {
            color = (props.theme === "dark" ? cssVariable("--bs-gray-900") : cssVariable("--bs-black")) ?? color;
        }

        if(props.variable) {
            color = cssVariable(props.variable) ?? color;
        }

        localIcon = localIcon.replace(/currentColor/g, color);

        return window.btoa(localIcon);
    })

    const icon = computed(() => {
        return props.cls ? (props.icons || {})[innerClassToParent(props.cls)] : props.customIcon;
    })

    function innerClassToParent(cls:string) {
        return cls.includes("$") ? cls.substring(0, cls.indexOf("$")) : cls;
    }
</script>

<style lang="scss" scoped>
    .wrapper {
        display: inline-block;
        width: 100%;
        height: 100%;
        position: relative;

        :deep(span) {
            position: absolute;
            padding: 1px;
            left: 0;
            display: block;
            width: 100%;
            height: 100%;
        }

        :deep(.icon) {
            width: 100%;
            height: 100%;
            display: block;
            border-radius: 3px;
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center center;
        }
    }
</style>
