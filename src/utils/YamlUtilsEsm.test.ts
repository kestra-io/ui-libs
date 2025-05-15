import {test, expect, describe} from "vitest";
import * as YamlUtilsEsm from "./YamlUtilsEsm";


describe("extractPluginProperty", () => {
    test("extracting a trigger", () => {
        const yamlString = `
        triggers:
          - id: plugin1
            type: type1
            name: Plugin 1
          - id: plugin2
            type: type2
            name: Plugin 2
        `;

        const block = "triggers";
        const key = "plugin1";

        const result = YamlUtilsEsm.extractPluginProperty(yamlString, block, key);

        expect(result).toMatchInlineSnapshot(`
          "id: plugin1
          type: type1
          name: Plugin 1
          "
        `);
    })

    test("extracting a task", () => {
        const yamlString = `
        tasks:
          - id: plugin1
            type: type1
            name: Plugin 1
          - id: plugin2
            type: type2
            name: Plugin 2
        `;

        const block = "tasks";
        const key = "plugin1";

        const result = YamlUtilsEsm.extractPluginProperty(yamlString, block, key);

        expect(result).toMatchInlineSnapshot(`
          "id: plugin1
          type: type1
          name: Plugin 1
          "
        `);
    })

    test("extracting a pluginDefaults", () => {
        const yamlString = `
        tasks:
          - id: plugin1
            type: type1
            name: Plugin 1
          - id: plugin2
            type: type2
            name: Plugin 2
        pluginDefaults:
          - type: type1
            name: Plugin Default 1
          - type: type2
            name: Plugin Default 2
        `;

        const block = "pluginDefaults";
        const key = "type1";

        const result = YamlUtilsEsm.extractPluginProperty(yamlString, block, key, "type");

        expect(result).toMatchInlineSnapshot(`
          "type: type1
          name: Plugin Default 1
          "
        `);
    })
});

describe("swapPluginPropertyInDocument", () => {
    test("swapping a trigger", () => {
        const yamlString = `
        triggers:
          - id: plugin1
            type: type1
            name: Plugin 1
          - id: pluginBetween
            type: type1
            name: Plugin 1
          - id: plugin2
            type: type2
            name: Plugin 2
        `;

        const block = "triggers";
        const key = "plugin1";
        const newValue = "plugin2";

        const result = YamlUtilsEsm.swapPluginPropertyInDocument(yamlString, block, key, newValue);

        expect(result).toMatchInlineSnapshot(`
          "
                  triggers:
                    - id: plugin1
                      type: type1
                      name: Plugin 1
                    - id: pluginBetween
                      type: type1
                      name: Plugin 1
                    - id: plugin2
                      type: type2
                      name: Plugin 2
                  "
        `);
    })
})
