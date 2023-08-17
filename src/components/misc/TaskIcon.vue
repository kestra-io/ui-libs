<template>
    <div
        :class="[color ? `bg-${color}`: '']"
        class="div-icon rounded d-flex justify-content-center"
    >
        <img :src="backgroundImage" alt="task icon">
    </div>
</template>
<script>
    import {Buffer} from "buffer";

    export default {
        name: "TaskIcon",
        props: {
            icon: {
                type: Object,
                default: undefined
            },
            color: {
                type: String,
                default: undefined
            }
        },
        computed: {
            backgroundImage() {
                return `data:image/svg+xml;base64,${this.imageBase64}`
            },
            imageBase64() {
                const icon = this.icon ? this.icon.icon : undefined;
                return icon ? icon : Buffer.from("<svg xmlns=\"http://www.w3.org/2000/svg\" " +
                    "xmlns:xlink=\"http://www.w3.org/1999/xlink\" aria-hidden=\"true\" " +
                    "focusable=\"false\" width=\"0.75em\" height=\"1em\" style=\"-ms-transform: " +
                    "rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);\" " +
                    "preserveAspectRatio=\"xMidYMid meet\" viewBox=\"0 0 384 512\">" +
                    "<path d=\"M288 32H0v448h384V128l-96-96zm64 416H32V64h224l96 96v288z\" fill=\"#0D1523FF\"/>" +
                    "</svg>", "utf8").toString("base64");
            },
        }
    }
</script>
<style scoped>
    .div-icon {
        padding: 0.3rem;
        margin: 0.2rem;
        width: 25px;
        height: 25px;
        background-color: var(--bs-white);
        border: 0.4px solid var(--bs-border-color);
    }
</style>