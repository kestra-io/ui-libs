<template>
    <div
        :class="[color ? `bg-${color}`: 'bg-white']"
        class="div-icon rounded"
    >
        <Tooltip :title="cls">
            <img :src="backgroundImage" :alt="cls">
        </Tooltip>
    </div>
</template>
<script>
    import {mapState} from "vuex";
    import {Buffer} from "buffer";
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
            color: {
                type: String,
                default: undefined
            },
            theme: {
                type: String,
                default: undefined,
                validator(value) {
                    return ["dark", "light"].includes(value)
                }
            }
        },
        computed: {
            ...mapState("plugin", ["icons"]),
            backgroundImage() {
                return `data:image/svg+xml;base64,${this.imageBase64}`
            },
            imageBase64() {
                let icon = this.icon && this.icon.icon ? Buffer.from(this.icon.icon, "base64").toString("utf8") : undefined;

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

                icon = icon.replaceAll("currentColor", color);

                return Buffer.from(icon, "utf8").toString("base64");
            },
            icon() {
                return this.cls ? (this.icons || {})[this.cls] : this.customIcon;
            }
        }
    }
</script>

<style lang="scss" scoped>
    .div-icon {
        padding: 0.1rem;
        margin: 0.2rem;
        width: 25px;
        height: 25px;
        border: 0.4px solid var(--bs-border-color);
        position: relative;

        :deep(span) {
            position: absolute;
            top: -2px;
            left: 0;
        }

        :deep(img) {
            max-width: 100%;
        }
    }


</style>
