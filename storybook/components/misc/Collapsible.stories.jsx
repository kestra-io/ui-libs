import {onMounted} from "vue";
import {useRouter, useRoute} from "vue-router";
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
                component: {template:"<div>Home</div>"}
            }
        ])
    ],
};

const Template = (args) => ({
  setup() {
    return () => <Collapsible {...args}>
        {{
            content: () => <div style="width:200px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec purus nec nunc tincidunt ultricies. Nullam nec purus nec nunc</div>
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

export const RoutingTest = () => ({
    setup() {
        const router = useRouter();
        onMounted(() => {
            router.replace({
                hash: "#routing-test-body"
            })
        });
        const route = useRoute()
        return () => <div>
            <pre>{route.fullPath}</pre>
            <Collapsible href="routing-test" clickableText="Routing Test">
                {{
                    content: () => <div style="width:200px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec purus nec nunc tincidunt ultricies. Nullam nec purus nec nunc</div>
                }}
            </Collapsible>
        </div>
    }
})
