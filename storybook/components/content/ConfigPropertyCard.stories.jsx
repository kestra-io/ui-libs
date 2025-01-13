import ConfigPropertyCard from "../../../src/components/content//ConfigPropertyCard.vue"

export default {
    title: "Components/Content/ConfigPropertyCard",
    component: ConfigPropertyCard,
    argTypes: {
        type: {control: "text"},
        defaultValue: {control: "text"},
        validValues: {control: "text"}
    }
}

export const Default = {
    args: {
        type: "string",
        defaultValue: "default",
        validValues: "option1, option2, option3"
    }
}

export const BooleanProperty = {
    args: {
        type: "boolean",
        defaultValue: "false"
    }
} 
