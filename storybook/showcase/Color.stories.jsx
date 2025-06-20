import ShowCaseColors from "./Colors.vue";

const meta = {
    title: "theme/ShowCase",
    component: ShowCaseColors,
}

export default meta;

/**
 * @type {import('@storybook/vue3-vite').StoryObj<typeof ShowCaseColors>}
 */
export const Colors = {
    render: () => <ShowCaseColors />,
}
