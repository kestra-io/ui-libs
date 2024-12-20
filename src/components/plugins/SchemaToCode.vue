<template>
    <div class="code-block mb-3" @mouseover="hoverCode" @mouseleave="isHoveringCode = false">
        <div class="language" v-if="language">
            {{ language }}
        </div>
        <template v-if="isHoveringCode">
            <button ref="copyButton" class="copy">
                <component
                    :is="copyIcon"
                    @click="copyToClipboard"
                />
            </button>
            <div ref="copyTooltip" v-if="!!copyIconResetTimer" id="copied-tooltip" role="tooltip">
                Copied!
                <div id="arrow" data-popper-arrow />
            </div>
        </template>
        <div v-html="codeData" />
    </div>
</template>

<script>
    import {createPopper} from "@popperjs/core";
    import {codeToHtml} from "shiki";
    import ContentCopy from "vue-material-design-icons/ContentCopy.vue";
    import Check from "vue-material-design-icons/Check.vue";
    import {defineComponent, nextTick, shallowRef} from "vue";

    export default defineComponent({
        props: {
            code: {
                type: String,
                default: ""
            },
            language: {
                type: String,
                default: null
            },
            filename: {
                type: String,
                default: null
            },
            highlights: {
                type: Array,
                default: () => []
            },
            meta: {
                type: String,
                default: null
            }
        },
        data() {
            return {
                icons: shallowRef({
                    ContentCopy: shallowRef(ContentCopy),
                    Check: shallowRef(Check)
                }),
                copyIcon: undefined,
                copyIconResetTimer: undefined,
                isHoveringCode: false,
                codeData: null,
            }
        },
        async created() {
            this.copyIcon = this.icons.ContentCopy;
            this.codeData = await codeToHtml(this.code, {
                lang: this.language,
                theme: "github-dark",
            });
        },
        methods: {
            hoverCode(){
                this.isHoveringCode = true;
                if(this.copyIconResetTimer) {
                    nextTick(() => {
                        createPopper(this.$refs.copyButton, this.$refs.copyTooltip, {
                            placement: "left",
                        });
                    });
                }
            },
            copyToClipboard() {
                clearTimeout(this.copyIconResetTimer);

                navigator.clipboard.writeText(this.code.trimEnd())

                this.copyIcon = this.icons.Check;

                this.copyIconResetTimer = setTimeout(() => {
                    this.copyIcon = this.icons.ContentCopy;
                    this.copyIconResetTimer = undefined;
                }, 2000)
            },
        },
    });
</script>

<style lang="scss" scoped>
    .code-block {
        background-color: #161617;
        border: 1px solid #252526;
        padding: 1.25rem 1.5rem;
        border-radius: var(--bs-border-radius-lg);
        color: var(--bs-white);
        position: relative;

        .language {
            position: absolute;
            right: 0.35rem;
            top: 0.25rem;
            color: var(--bs-gray-600);
            font-size: 0.75rem;
        }

        :deep(pre) {
            margin-bottom: 0;
        }

        :deep(.github-dark) {
            background-color: transparent !important;
            code {
                display: flex;
                flex-direction: column;
            }
        }

        .copy {
            position: absolute;
            right: 0;
            bottom: 0.1rem;
            color: #7081b9;
            border: none;
            background: none;
        }

        #copied-tooltip {
            border-radius: .25rem;
            background: #8997bd;
            padding: 4px 8px;
            font-size: 0.75rem;
            margin-right: 0.2rem !important;

            #arrow,
            #arrow::before {
                position: absolute;
                width: 8px;
                height: 8px;
                background: inherit;
            }

            #arrow {
                visibility: hidden;
                right: -4px;
            }

            #arrow::before {
                visibility: visible;
                content: '';
                transform: rotate(45deg);
            }
        }
    }

    :deep(pre code .line) {
        display: block;
        min-height: 1rem;
    }
</style>
