/** @type { import('@storybook/vue3-vite').StorybookConfig } */
const config = {
    stories: ["../storybook/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
    addons: ["@storybook/addon-themes", "@storybook/addon-docs"],
    framework: {
        name: "@storybook/vue3-vite",
        options: {},
    },
};

export default config;
