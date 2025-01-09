import Collapse from "./Collapse.vue"

export default {
    title: "Components/Content/Collapse",
    component: Collapse,
    argTypes: {
        title: {
            control: "text"
        }
    }
}

export const Default = {
    args: {
        title: "Click to expand"
    },
    render: (args) => ({
        setup() {
            return () => <Collapse {...args}>
                <p>This is the collapsible content</p>
                <p>You can put any content here</p>
            </Collapse>
        }
    })
} 