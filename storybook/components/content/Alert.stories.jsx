import Alert from "../../../src/components/content/Alert.vue"

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

export const AllAlerts = {
    render: () => ({
        setup() {
            return () => <>
                <Alert type="info">This is an info alert</Alert>
                <Alert type="warning">This is a warning alert</Alert>
                <Alert type="danger">This is a danger alert</Alert>
                <Alert type="success">This is a success alert</Alert>
            </>
        }
    })
}

export const AlertsWithLongText   = {
    render: () => ({
        setup() {
            return () => <Alert type="info">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore 
                magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </Alert>
        }
    })
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
            return () => <Alert {...args}>This is a danger alert</Alert>
        }
    })
}

export const Success = {
    args: {
        type: "success"
    },
    render: (args) => ({
        components: {Alert},
        setup() {
            return () => <Alert {...args}>This is a success alert</Alert>
        }
    })
} 
