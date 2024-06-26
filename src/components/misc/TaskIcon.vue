<template>
    <div
        :class="classes"
        class="wrapper"
    >
        <Tooltip v-if="!onlyIcon" :title="cls">
            <div class="icon" :style="styles" />
        </Tooltip>

        <div v-else class="icon" :style="styles" />
    </div>
</template>
<script>
    import Tooltip from "../misc/Tooltip.vue";
    import {cssVariable} from "../../utils/global.js";

    export default {
        name: "TaskIcon",
        components: {Tooltip},
        props: {
            customIcon: {
                type: Object,
                default: undefined
            },
            cls: {
                type: String,
                default: undefined
            },
            theme: {
                type: String,
                default: undefined,
                validator(value) {
                    return ["dark", "light"].includes(value)
                }
            },
            icons: {
                type: Object,
                default: undefined
            },
            onlyIcon: {
                type: Boolean,
                default: false
            },
            variable: {
                type: String,
                default: undefined
            },
        },
        computed: {
            backgroundImage() {
                return `data:image/svg+xml;base64,${this.imageBase64}`
            },
            classes() {
                return {
                    "flowable": this.icon ? this.icon.flowable : false,
                }
            },
            styles() {
                return {
                    backgroundImage: `url(data:image/svg+xml;base64,${this.imageBase64})`
                }
            },
            imageBase64() {
                let icon = this.icon && this.icon.icon ? window.atob(this.icon.icon) : undefined;

                if (!icon) {
                    icon = "<svg xmlns=\"http://www.w3.org/2000/svg\" " +
                        "xmlns:xlink=\"http://www.w3.org/1999/xlink\" aria-hidden=\"true\" " +
                        "focusable=\"false\" width=\"0.75em\" height=\"1em\" style=\"-ms-transform: " +
                        "rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);\" " +
                        "preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 384 512\">" +
                        "<path d=\"M288 32H0v448h384V128l-96-96zm64 416H32V64h224l96 96v288z\" fill=\"currentColor\"/>" +
                        "</svg>";
                }

                const darkTheme = document.getElementsByTagName("html")[0].className.indexOf("dark") >= 0;
                let color = darkTheme ? cssVariable("--bs-gray-900") : cssVariable("--bs-black");

                if (this.theme) {
                    color = this.theme === "dark" ? cssVariable("--bs-gray-900") : cssVariable("--bs-black");
                }

                if(this.variable) {
                    color = cssVariable(this.variable);
                }

                icon = icon.replaceAll("currentColor", color);

                return window.btoa(icon);
            },
            icon() {
                return this.cls ? (this.icons || {})[this.innerClassToParent(this.cls)] : this.customIcon;
            }
        },
        methods: {
            innerClassToParent(cls) {
                return cls.includes("$") ? cls.substring(0, cls.indexOf("$")) : cls;
            }
        }
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
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center center;
        }
    }
</style>
