<template>
    <template v-if="language === 'mermaid'">
        <Mermaid>
            {{ code }}
        </Mermaid>
    </template>
    <div class="code-block mb-3" @mouseover="hoverCode" @mouseleave="isHoveringCode = false" v-else>
        <div class="language" v-if="language">
            {{ language }}
        </div>
        <template v-if="isHoveringCode">
            <button ref="copyButton" class="copy" @click="copyToClipboard" :disabled="copiedSuccessfully">
                <CheckIcon v-if="copiedSuccessfully" />
                <ContentCopy v-else />
            </button>
            <div ref="copyTooltip" v-if="!!copyIconResetTimer" id="copied-tooltip" role="tooltip">
                Copied!
                <div id="arrow" data-popper-arrow />
            </div>
        </template>
        <slot />
    </div>
</template>

<script setup lang="ts">
    import {createPopper} from "@popperjs/core";

    import ContentCopy from "vue-material-design-icons/ContentCopy.vue";
    import CheckIcon from "vue-material-design-icons/Check.vue";
    import {nextTick, Ref, ref} from "vue";
    import Mermaid from "./Mermaid.vue";

    const props = withDefaults(defineProps<{
        code:string,
        language: string,
        filename?: string,
        highlights?: string,
        meta?: string,
    }>(), {
        filename: undefined,
        highlights: undefined,
        meta: undefined,
    })

    const copiedSuccessfully = ref(false)

    const copyIconResetTimer = ref()
    const isHoveringCode = ref(false)

    const copyButton: Ref<HTMLButtonElement | undefined> = ref()
    const copyTooltip: Ref<HTMLElement | undefined> = ref()


    function hoverCode(){
        isHoveringCode.value = true;
        if(copyIconResetTimer.value) {
            nextTick(() => {
                if(copyButton.value && copyTooltip.value){
                    createPopper(copyButton.value, copyTooltip.value, {
                        placement: "left",
                    });
                }
            });
        }
    }
    function copyToClipboard() {
        clearTimeout(copyIconResetTimer.value);

        navigator.clipboard.writeText(props.code.trimEnd())

        copiedSuccessfully.value = true;

        copyIconResetTimer.value = setTimeout(() => {
            copiedSuccessfully.value = false;
            copyIconResetTimer.value = undefined;
        }, 2000)
    }
        
</script>

<style lang="scss" scoped>
    @import "../../scss/variables";

    .code-block {
        background-color: $black-2;
        border: $block-border;
        padding: 1.25rem 1.5rem;
        border-radius: var(--bs-border-radius-lg);
        color: var(--bs-white);
        position: relative;

        .language {
            position: absolute;
            right: 0.35rem;
            top: 0.25rem;
            color: var(--bs-gray-600);
            font-size: calc($font-size-base * .75);
        }

        :deep(pre) {
            margin-bottom: 0;
        }

        .copy {
            position: absolute;
            right: 0;
            bottom: 0.1rem;
            color: $gray-600;
            border: none;
            background: none;
        }

        #copied-tooltip {
            border-radius: $border-radius;
            background: $gray-500;
            padding: 4px 8px;
            font-size: $font-size-xs;
            margin-right: $popper-margin !important;

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
