/** @type { import('@storybook/vue3-vite').StorybookConfig } */
const config = {
    stories: ["../storybook/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
    addons: [
        "@storybook/addon-essentials",
        "@storybook/addon-themes",
        "@storybook/addon-interactions",
    ],
    framework: {
        name: "@storybook/vue3-vite",
        options: {},
    },
};

export default config;
