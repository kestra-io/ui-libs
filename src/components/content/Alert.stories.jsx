import Alert from "./Alert.vue"

export default {
    title: "Components/Content/Alert",
    component: Alert,
    argTypes: {
        type: {
            control: "select",
            options: ["info", "warning", "danger", "success"]
        }
    }
}

export const Info = {
    args: {
        type: "info"
    },
    render: (args) => ({
        setup() {
            return () => <Alert {...args}>This is an info alert</Alert>
        }
    })
}

export const Warning = {
    args: {
        type: "warning"
    },
    render: (args) => ({
        setup() {
            return () => <Alert {...args}>This is a warning alert</Alert>
        }
    })
}

export const Danger = {
    args: {
        type: "danger"
    },
    render: (args) => ({
        components: {Alert},
        setup() {
            return {args}
        },
        template: `
            <Alert v-bind="args">
                This is a danger alert
            </Alert>
        `
    })
}

export const Success = {
    args: {
        type: "success"
    },
    render: (args) => ({
        components: {Alert},
        setup() {
            return {args}
        },
        template: `
            <Alert v-bind="args">
                This is a success alert
            </Alert>
        `
    })
} 