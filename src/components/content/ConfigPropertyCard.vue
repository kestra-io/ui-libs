<template>
    <div class="config-property-card">
        <table class="table table-dark">
            <tbody>
                <tr>
                    <td class="label">
                        Type
                    </td>
                    <td>{{ type }}</td>
                </tr>
                <tr>
                    <td class="label">
                        Default
                    </td>
                    <td>
                        <prose-code>{{ defaultValue }}</prose-code>
                    </td>
                </tr>
                <tr v-if="validValues">
                    <td class="label">
                        Valid values:
                    </td>
                    <td>
                        <prose-code>[ {{ validValues }} ]</prose-code>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<script>
    import {defineComponent} from "vue";
    import ProseCode from "./ProseCode.vue";

    export default defineComponent({
        components: {ProseCode},
        props: {
            type: {
                type: String,
                default: undefined,
                required: true
            },
            defaultValue: {
                type: [String, Boolean, Number, Array, Object],
                default: ""
            },
            validValues: {
                type: String,
                default: ""
            },
        },
    });
</script>

<style lang="scss" scoped>
    .config-property-card {
        table {
            min-width: 50%;
        }

        tr td:first-child {
            width: 10em;
            min-width: 10em;
            max-width: 10em;
            word-break: break-all;
        }

        td {
            font-size: 1rem;
            padding: 0.6rem 1rem;
        }

        td.label {
            font-weight: bold;
            padding-right: 1em;
        }
    }
</style>