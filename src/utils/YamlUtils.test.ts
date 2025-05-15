import {test, expect, describe} from "vitest";
import * as YamlUtils from "./YamlUtils";


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

        const result = YamlUtils.extractPluginProperty(yamlString, block, key);

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

        const result = YamlUtils.extractPluginProperty(yamlString, block, key);

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

        const result = YamlUtils.extractPluginProperty(yamlString, block, key, "type");

        expect(result).toMatchInlineSnapshot(`
          "type: type1
          name: Plugin Default 1
          "
        `);
    })
});

describe("swapPluginProperties", () => {
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

        const result = YamlUtils.swapPluginProperties(yamlString, block, key, newValue);

        expect(result).toMatchInlineSnapshot(`
          "triggers:
            - id: plugin2
              type: type2
              name: Plugin 2
            - id: pluginBetween
              type: type1
              name: Plugin 1
            - id: plugin1
              type: type1
              name: Plugin 1
          "
        `);
    })
})

describe("insertPluginProperty", () => {
    test("inserting a task", () => {
        const srcWithTasks = `
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
        const newValue = `
            id: plugin3
            type: type3
            name: Plugin 3
        `;
        const result = YamlUtils.insertPluginProperty(srcWithTasks, block, newValue, key);
        expect(result).toMatchInlineSnapshot(`
          "tasks:
            - id: plugin1
              type: type1
              name: Plugin 1
            - id: plugin3
              type: type3
              name: Plugin 3
            - id: plugin2
              type: type2
              name: Plugin 2
          "
        `)
    })

    test("inserting a task on empty", () => {
        const srcWithTriggers = `
        triggers:
          - id: plugin1
            type: type1
            name: Plugin 1
          - id: plugin2
            type: type2
            name: Plugin 2
        `;
        const block = "tasks";
        const key = "plugin1";
        const newValue = `
            id: plugin3
            type: type3
            name: Plugin 3
        `;
        const result = YamlUtils.insertPluginProperty(srcWithTriggers, block, newValue, key);
        expect(result).toMatchInlineSnapshot(`
          "triggers:
            - id: plugin1
              type: type1
              name: Plugin 1
            - id: plugin2
              type: type2
              name: Plugin 2
          tasks:
            - id: plugin3
              type: type3
              name: Plugin 3
          "
        `)
    })

    test("inserting a task omitting the refKey", () => {
        const srcWithTasks = `
        tasks:
          - id: plugin1
            type: type1
            name: Plugin 1
          - id: plugin2
            type: type2
            name: Plugin 2
        `;
        const block = "tasks";
        const newValue = `
            id: plugin3
            type: type3
            name: Plugin 3
        `;
        const result = YamlUtils.insertPluginProperty(srcWithTasks, block, newValue);
        expect(result).toMatchInlineSnapshot(`
          "tasks:
            - id: plugin1
              type: type1
              name: Plugin 1
            - id: plugin2
              type: type2
              name: Plugin 2
            - id: plugin3
              type: type3
              name: Plugin 3
          "
        `)
    })

    test("insert a task before", () => {
        const srcWithTasks = `
        tasks:
          - id: plugin1
            type: type1
            name: Plugin 1
          - id: plugin2
            type: type2
            name: Plugin 2
        `;
        const block = "tasks";
        const newValue = `
            id: plugin3
            type: type3
            name: Plugin 3
        `;
        const result = YamlUtils.insertPluginProperty(srcWithTasks, block, newValue, undefined, "before");
        expect(result).toMatchInlineSnapshot(`
          "tasks:
            - id: plugin3
              type: type3
              name: Plugin 3
            - id: plugin1
              type: type1
              name: Plugin 1
            - id: plugin2
              type: type2
              name: Plugin 2
          "
        `)
    })

    test("inserting a trigger", () => {
        const srcWithTriggers = `
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
        const newValue = `
            id: plugin3
            type: type3
            name: Plugin 3
        `;
        const result = YamlUtils.insertPluginProperty(srcWithTriggers, block, newValue, key);
        expect(result).toMatchInlineSnapshot(`
          "triggers:
            - id: plugin1
              type: type1
              name: Plugin 1
            - id: plugin3
              type: type3
              name: Plugin 3
            - id: plugin2
              type: type2
              name: Plugin 2
          "
        `)
    })

    test("insert subtask", () => {
        const srcWithTasks = `
        tasks:
          - id: t1
            type: type1
            name: Plugin 1
            tasks: 
              - id: t1-2
                type: type2
                name: plugin 2
            `
        const newValue = `
            id: t1-1
            type: type3
            name: Plugin 3
        `;
        const result = YamlUtils.insertPluginProperty(srcWithTasks, "tasks", newValue, undefined, "after", "t1");
        expect(result).toMatchInlineSnapshot(`
          "tasks:
            - id: t1
              type: type1
              name: Plugin 1
              tasks:
                - id: t1-2
                  type: type2
                  name: plugin 2
                - id: t1-1
                  type: type3
                  name: Plugin 3
          "
        `)
    })

    test("insert subtask on empty", () => {
        const srcWithTasks = `
        tasks:
          - id: t1
            type: type1
            name: Plugin 1
        `

        const newValue = `
            id: t1-1
            type: type3
            name: Plugin 3
        `;
        const result = YamlUtils.insertPluginProperty(srcWithTasks, "tasks", newValue, undefined, "after", "t1");
        expect(result).toMatchInlineSnapshot(`
          "tasks:
            - id: t1
              type: type1
              name: Plugin 1
              tasks:
                - id: t1-1
                  type: type3
                  name: Plugin 3
          "
        `)
    })
})
