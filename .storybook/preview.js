import {withThemeByClassName} from "@storybook/addon-themes";

import "../src/scss/theme-light.scss";
import "../src/scss/theme-dark.scss";

/** @type { import('@storybook/vue3').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    withThemeByClassName({
        themes: {
            light: "light",
            dark: "dark",
        },
        defaultTheme: "light",
    }),
  ]
};

export default preview;
