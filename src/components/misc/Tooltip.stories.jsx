import Tooltip from "./Tooltip.vue"

export default {
    title: "Components/Misc/Tooltip",
    component: Tooltip,
    argTypes: {
        title: {control: "text"},
        placement: {
            control: "select",
            options: ["top", "right", "bottom", "left"]
        }
    }
}

export const Default = {
    args: {
        title: "This is a tooltip"
    },
    render: (args) => ({
        components: {Tooltip},
        setup() {
            return {args}
        },
        template: `
            <div style="padding: 50px">
                <Tooltip v-bind="args">
                    <button>Hover me</button>
                </Tooltip>
            </div>
        `
    })
}

export const WithCustomContent = {
    render: () => ({
        components: {Tooltip},
        template: `
            <div style="padding: 50px">
                <Tooltip placement="right">
                    <button>Hover for custom content</button>
                    <template #content>
                        <div>
                            <strong>Custom HTML content</strong>
                            <br>
                            With multiple lines
                        </div>
                    </template>
                </Tooltip>
            </div>
        `
    })
}

export const DifferentPlacements = {
    render: () => ({
        components: {Tooltip},
        template: `
            <div style="padding: 100px; display: flex; gap: 20px;">
                <Tooltip title="Top tooltip" placement="top">
                    <button>Top</button>
                </Tooltip>
                <Tooltip title="Right tooltip" placement="right">
                    <button>Right</button>
                </Tooltip>
                <Tooltip title="Bottom tooltip" placement="bottom">
                    <button>Bottom</button>
                </Tooltip>
                <Tooltip title="Left tooltip" placement="left">
                    <button>Left</button>
                </Tooltip>
            </div>
        `
    })
} 