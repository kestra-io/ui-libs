import ProseBlockquote from "../../../src/components/content/ProseBlockquote.vue"

export default {
    title: "Components/Content/ProseBlockquote",
    component: ProseBlockquote
}

export const Default = {
    render: () => ({
        components: {ProseBlockquote},
        template: `
            <ProseBlockquote>
                <p>This is a blockquote example</p>
                <p>It can contain multiple paragraphs</p>
            </ProseBlockquote>
        `
    })
} 
