import CollapsibleProperties from "../../../src/components/plugins/CollapsibleProperties.vue";
import {vueRouter} from "storybook-vue3-router";

export default {
    title: "Components/plugins/CollapsibleProperties",
    component: CollapsibleProperties,
    decorators: [vueRouter([
        {
            path: "/",
            name: "home",
            component: {template: "<div>home</div>"}
        }])
    ],
};

const Template = (args) => ({
    setup() {
        return () =>
            <CollapsibleProperties {...args} />
    },
});

export const Default = Template.bind({});
Default.args = {
    sectionName: "Default Section",
    properties: {
        property1: {$required: true, type: "string"},
        property2: {type: "number"},
    },
    showDynamic: true,
    initiallyExpanded: false,
};

export const WithDynamicProperties = Template.bind({});
WithDynamicProperties.args = {
    sectionName: "Dynamic Properties Section",
    properties: {
        property1: {$required: true, type: "string", $dynamic: true},
        property2: {type: "number", $dynamic: false},
    },
    showDynamic: true,
    initiallyExpanded: false,
};

export const InitiallyExpanded = Template.bind({});
InitiallyExpanded.args = {
    sectionName: "Initially Expanded Section",
    properties: {
        property1: {$required: true, type: "string"},
        property2: {type: "number"},
    },
    showDynamic: true,
    initiallyExpanded: true,
};

export const LargePropertiesList = Template.bind({});
LargePropertiesList.args = {
    sectionName: "Large Properties List",
    // This will force to include property4 even if it is deprecated
    forceInclude: ["property4"],
    properties: {
        property1: {$required: true, type: "string"},
        property2: {type: "number", $dynamic: true, $deprecated: true},
        property3: {type: "boolean", $dynamic: true},
        property4: {type: "array", $dynamic: true, $deprecated: true},
        property5: {type: "object", $deprecated: true},
        property6: {type: "string"},
        property7: {type: "number", $dynamic: true},
        property8: {type: "boolean", $dynamic: true},
        property9: {type: "array", $dynamic: true},
        property10: {type: "object", $dynamic: true},
        provider: {
            anyOf: [
                {
                    $ref: "#/$defs/io.kestra.plugin.langchain4j.provider.AmazonBedrock",
                    title: "Language Model Provider",
                },
                {
                    $ref: "#/$defs/io.kestra.plugin.langchain4j.provider.Anthropic",
                    title: "Language Model Provider",
                },
                {
                    $ref: "#/$defs/io.kestra.plugin.langchain4j.provider.AzureOpenAI",
                    title: "Language Model Provider",
                },
                {
                    $ref: "#/$defs/io.kestra.plugin.langchain4j.provider.DeepSeek",
                    title: "Language Model Provider",
                },
                {
                    $ref: "#/$defs/io.kestra.plugin.langchain4j.provider.GoogleGemini",
                    title: "Language Model Provider",
                },
                {
                    $ref: "#/$defs/io.kestra.plugin.langchain4j.provider.GoogleVertexAI",
                    title: "Language Model Provider",
                },
                {
                    $ref: "#/$defs/io.kestra.plugin.langchain4j.provider.MistralAI",
                    title: "Language Model Provider",
                },
                {
                    $ref: "#/$defs/io.kestra.plugin.langchain4j.provider.Ollama",
                    title: "Language Model Provider",
                },
                {
                    $ref: "#/$defs/io.kestra.plugin.langchain4j.provider.OpenAI",
                    title: "Language Model Provider",
                }
            ],
            title: "Language Model Provider",
            $required: true,
        },
    },
    showDynamic: true,
    initiallyExpanded: false,
};
