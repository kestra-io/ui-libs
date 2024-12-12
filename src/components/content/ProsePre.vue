<script setup lang="ts">
    import {createPopper} from "@popperjs/core";

    import ContentCopy from "vue-material-design-icons/ContentCopy.vue";
    import Check from "vue-material-design-icons/Check.vue";
    import {nextTick, ref, shallowRef} from "vue";
    import Mermaid from "./Mermaid.vue";

    const props = defineProps({
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
    })
    
    const icons = {
        ContentCopy: shallowRef(ContentCopy),
        Check: shallowRef(Check)
    }
            
    const copyIcon = ref(icons.ContentCopy)
    const copyIconResetTimer = ref<number|undefined>(undefined)
    const isHoveringCode = ref(false)
    const copyButton = ref<HTMLButtonElement | null>(null)
    const copyTooltip = ref<HTMLDivElement | null>(null)
            
        
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

        copyIcon.value = icons.Check;

        copyIconResetTimer.value = setTimeout(() => {
            copyIcon.value = icons.ContentCopy;
            copyIconResetTimer.value = undefined;
        }, 2000)
    }
</script>

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
        <slot />
    </div>
</template>

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
