import {vueRouter} from "storybook-vue3-router";
import Collapsible from "../../../src/components/misc/Collapsible.vue";

export default {
  title: "Components/Misc/Collapsible",
  component: Collapsible,
  decorators: [
        vueRouter([
            {
                path: "/",
                name: "home",
                component: Collapsible
            }
        ])
    ],
};

const Template = (args) => ({
  setup() {
    return () => <Collapsible {...args}>
        {{
            content: () => <>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec purus nec nunc tincidunt ultricies. Nullam nec purus nec nunc</>
        }}
    </Collapsible>
  }
});

export const Default = Template.bind({});
Default.args = {
  href: "example",
  clickableText: "Click me",
  arrow: true,
  initiallyExpanded: false,
};

export const InitiallyExpanded = Template.bind({});
InitiallyExpanded.args = {
  href: "example-expanded",
  clickableText: "Click me",
  arrow: true,
  initiallyExpanded: true,
};