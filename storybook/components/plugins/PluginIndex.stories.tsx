import PluginIndex from "../../../src/components/plugins/PluginIndex.vue";
import {vueRouter} from "storybook-vue3-router";

export default {
  title: "Components/Plugins/PluginIndex",
  component: PluginIndex,
  decorators: [
    vueRouter([{
        path: "/",
        name: "home",
        component: PluginIndex
    }]),
  ]
}

const iconBase64 = "PHN2ZyB3aWR0aD0nNTRweCcgaGVpZ2h0PSc1NHB4JyB2aWV3Qm94PScwIDAgMjQgMjQnIGZpbGw9J25vbmUnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PGcgaWQ9J1NWR1JlcG9fYmdDYXJyaWVyJyBzdHJva2Utd2lkdGg9JzAnPjwvZz48ZyBpZD0nU1ZHUmVwb190cmFjZXJDYXJyaWVyJyBzdHJva2UtbGluZWNhcD0ncm91bmQnIHN0cm9rZS1saW5lam9pbj0ncm91bmQnPjwvZz48ZyBpZD0nU1ZHUmVwb19pY29uQ2Fycmllcic+PHBhdGggZD0nTTE2IDhMOCAxNk0xMiAxMkwxNiAxNk04IDhMMTAgMTAnIHN0cm9rZT0nIzAwMDAwMCcgc3Ryb2tlLXdpZHRoPScxLjUnIHN0cm9rZS1saW5lY2FwPSdyb3VuZCcgc3Ryb2tlLWxpbmVqb2luPSdyb3VuZCc+PC9wYXRoPjwvZz48L3N2Zz4="

export const Default = {
  render: () => ({
    setup() {
      return () => <PluginIndex 
        pluginName="Plugin Example" 
        plugins={[
            {
                name: "nameExample",
                title: "titleExample",
                group: "groupExample",
                subGroup: "subGroupExample",
                tasks: ["io.kestra.plugins.core.task1", "io.kestra.plugins.core.task2"],
            }
        ]}
        icons={{
            "io.kestra.plugins.core.task1": iconBase64,
            "io.kestra.plugins.core.task2": iconBase64,
            "subGroupExample": iconBase64
        }} 
      />
    },
  }),
}

export const Grouped = {
  render: () => ({
    setup() {
      return () => <PluginIndex 
        pluginName="Plugin Example" 
        plugins={[
            {
                name: "nameExample",
                title: "titleExample",
                group: "groupExample",
                subGroup: "subGroupExample",
                tasks: [
                    "io.kestra.plugin.github.issues.Search", 
                    "io.kestra.plugin.github.issues.Create",
                    "io.kestra.plugin.github.code.Search",
                    "io.kestra.plugin.github.commits.Search",
                    "io.kestra.plugin.github.pulls.Create",
                ],
            }
        ]}
        icons={{
            "subGroupExample": iconBase64
        }} 
      />
    },
  }),
}