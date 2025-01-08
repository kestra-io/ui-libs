import ShowCaseColors from "./ShowCaseColors.vue";

const meta = {
    title: "theme/ShowCaseColors",
    component: ShowCaseColors,
}

export default meta;

/**
 * @type {import('@storybook/vue3').StoryObj<typeof ShowCaseColors>}
 */
export const ColorsPlayground = {
    render: () => <ShowCaseColors />,
}