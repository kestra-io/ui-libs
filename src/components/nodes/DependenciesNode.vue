<template>
    <Handle type="source" :position="sourcePosition" />
    <div
        :class="[`border-${data.color}`]"
        class="dependency-node-wrapper rounded-3 border"
    >
        <TaskIcon :custom-icon="{icon: icon}" class="bg-pink rounded" theme="light" />
        <div class="dependency-text d-flex flex-column flex-grow-1">
            <div class="dependency-flow-text text-truncate">
                <tooltip :title="data.flowId">
                    {{ data.flowId }}
                </tooltip>
            </div>
            <div class="dependency-namespace-text text-truncate">
                <tooltip :title="data.namespace">
                    {{ data.namespace }}
                </tooltip>
            </div>
        </div>

        <div class="text-white top-button-div">
            <slot name="badge-button-before" />
            <span
                v-if="data.link"
                class="rounded-button"
                :class="[`bg-${data.color}`]"
                @click="$emit(EVENTS.OPEN_LINK, data)"
            >
                <tooltip :title="$t('open')">
                    <OpenInNew class="button-icon" alt="Open in new tab" />
                </tooltip>
            </span>
            <span
                class="rounded-button"
                :class="[`bg-${data.color}`]"
                @click="$emit(EVENTS.EXPAND_DEPENDENCIES, data)"
            >
                <tooltip :title="$t('expand')">
                    <ArrowExpandAll class="button-icon" alt="Expand task" />
                </tooltip>
            </span>
            <slot name="badge-button-after" />
        </div>
    </div>
    <Handle type="target" :position="targetPosition" />
</template>

<script>
    import {Handle} from "@vue-flow/core";
    import TaskIcon from "../misc/TaskIcon.vue";
    import {Buffer} from "buffer";
    import OpenInNew from "vue-material-design-icons/OpenInNew.vue";
    import ArrowExpandAll from "vue-material-design-icons/ArrowExpandAll.vue";
    import {EVENTS} from "../../utils/constants.js";
    import Tooltip from "../misc/Tooltip.vue";

    export default {
        name: "Dependencies",
        components: {ArrowExpandAll, OpenInNew, TaskIcon, Handle, Tooltip},
        inheritAttrs: false,
        emits: [
            EVENTS.EXPAND_DEPENDENCIES,
            EVENTS.OPEN_LINK,
            EVENTS.MOUSE_OVER,
            EVENTS.MOUSE_LEAVE,
        ],
        computed: {
            EVENTS() {
                return EVENTS
            },
            icon() {
                return Buffer.from("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"25\" viewBox=\"0 0 24 25\" fill=\"none\">\n" +
                    "<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M4.34546 9.63757C4.74074 10.5277 5.31782 11.3221 6.03835 11.9681L7.03434 10.8209C6.4739 10.3185 6.02504 9.70059 5.71758 9.00824C5.41012 8.3159 5.25111 7.56496 5.25111 6.80532C5.25111 6.04568 5.41012 5.29475 5.71758 4.6024C6.02504 3.91006 6.4739 3.29216 7.03434 2.78977L6.03835 1.64258C5.31782 2.28851 4.74074 3.08293 4.34546 3.97307C3.95019 4.86321 3.74575 5.82867 3.74575 6.80532C3.74575 7.78197 3.95019 8.74744 4.34546 9.63757ZM16.955 4.38931C17.4802 3.97411 18.1261 3.74777 18.7913 3.74576C19.5894 3.74576 20.3547 4.06807 20.919 4.64177C21.4833 5.21548 21.8004 5.9936 21.8004 6.80494C21.8004 7.61628 21.4833 8.3944 20.919 8.96811C20.3547 9.54181 19.5894 9.86412 18.7913 9.86412C18.2559 9.86126 17.7312 9.71144 17.2725 9.43048L12.3325 14.4529L11.2688 13.3715L16.2088 8.34906C16.0668 8.10583 15.9592 7.84348 15.8891 7.56973H11.2688V6.04014H15.8891C16.055 5.38511 16.4298 4.80451 16.955 4.38931ZM17.9555 8.07674C18.2029 8.24482 18.4938 8.33453 18.7913 8.33453C19.1902 8.33412 19.5727 8.17284 19.8548 7.88607C20.1368 7.59931 20.2955 7.21049 20.2959 6.80494C20.2959 6.50241 20.2076 6.20668 20.0423 5.95514C19.877 5.70361 19.642 5.50756 19.3671 5.39178C19.0922 5.27601 18.7897 5.24572 18.4978 5.30474C18.206 5.36376 17.9379 5.50944 17.7275 5.72336C17.5171 5.93727 17.3738 6.20982 17.3157 6.50653C17.2577 6.80324 17.2875 7.11079 17.4014 7.39029C17.5152 7.66978 17.7081 7.90867 17.9555 8.07674ZM3.74621 15.2177V16.7473H7.19606L2.2417 21.7842L3.30539 22.8656L8.25975 17.8287V21.336H9.76427V15.2177H3.74621ZM15.7823 18.2769H12.7733V19.8064H15.7823V22.1008H21.8004V15.9825H15.7823V18.2769ZM17.2868 20.5712V17.5121H20.2959V20.5712H17.2868ZM8.02885 9.67292C7.62863 9.31407 7.30809 8.87275 7.08853 8.37827C6.86897 7.88378 6.75542 7.34747 6.75542 6.80494C6.75542 6.26241 6.86897 5.72609 7.08853 5.23161C7.30809 4.73713 7.62863 4.29581 8.02885 3.93696L9.02484 5.08415C8.78458 5.29946 8.59215 5.5643 8.46034 5.86106C8.32853 6.15782 8.26035 6.47971 8.26035 6.80532C8.26035 7.13094 8.32853 7.45282 8.46034 7.74958C8.59215 8.04634 8.78458 8.31118 9.02484 8.52649L8.02885 9.67292Z\" fill=\"white\"/>\n" +
                    "</svg>", "utf8").toString("base64");
            }
        },
        props: {
            data: {
                type: Object,
                required: true,
            },
            sourcePosition: {
                type: String,
                required: true
            },
            targetPosition: {
                type: String,
                required: true
            },
            id: {
                type: String,
                required: true
            }
        },
    }
</script>

<style scoped lang="scss">
    .dependency-node-wrapper {
        background-color: var(--bs-white);
        color: var(--bs-black);

        html.dark & {
            background-color: var(--card-bg);
            color: var(--bs-white);
        }

        width: 184px;
        height: 44px;
        margin: 0;
        padding: 8px 18px 8px 6px;
        display: flex;
        align-items: center;
        box-shadow: 0 12px 12px 0 rgba(130, 103, 158, 0.10);
    }

    .wrapper {
        width: 26px;
    }

    .dependency-text {
        margin-left: 0.5rem;
    }

    .dependency-flow-text {
        font-size: 0.85rem;
        font-weight: 700;
        max-width: 121px;
    }

    .dependency-namespace-text {
        font-size: 0.625rem;
        font-weight: 400;
        color: #564A75;
        max-width: 121px;

        html.dark & {
            color: #E3DBFF;
        }
    }

</style>
