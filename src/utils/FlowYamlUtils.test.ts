import {test, expect, describe} from "vitest";
import * as YamlUtils from "./FlowYamlUtils";


describe("extractBlock", () => {
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

        const section = "triggers";
        const key = "plugin1";

        const result = YamlUtils.extractBlock(yamlString, section, key);

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

        const section = "tasks";
        const key = "plugin1";

        const result = YamlUtils.extractBlock(yamlString, section, key);

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

        const section = "pluginDefaults";
        const key = "type1";

        const result = YamlUtils.extractBlock(yamlString, section, key, "type");

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

        const section = "triggers";
        const key = "plugin1";
        const newValue = "plugin2";

        const result = YamlUtils.swapBlocks(yamlString, section, key, newValue);

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

describe("insertBlock", () => {
    const srcWithTasks = `
        tasks:
          - id: plugin1
            type: type1
            name: Plugin 1
          - id: plugin2
            type: type2
            name: Plugin 2
        `;
    const newValue = `
            id: plugin3
            type: type3
            name: Plugin 3
        `;

    test("inserting a task", () => {
        
        const section = "tasks";
        const key = "plugin1";
        
        const result = YamlUtils.insertBlock(srcWithTasks, section, newValue, key);
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

    test("inserting a task when no tasks section is present", () => {
        const srcWithTriggers = `
        triggers:
          - id: plugin1
            type: type1
            name: Plugin 1
          - id: plugin2
            type: type2
            name: Plugin 2
        `;
        const section = "tasks";
        const key = "plugin1";
        const result = YamlUtils.insertBlock(srcWithTriggers, section, newValue, key);
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
        const section = "tasks";
        const result = YamlUtils.insertBlock(srcWithTasks, section, newValue);
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

    test("insert a task before everything", () => {
        const section = "tasks";
        const result = YamlUtils.insertBlock(srcWithTasks, section, newValue, undefined, "before");
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

    test("insert a task before plugin2", () => {
        const section = "tasks";
        const result = YamlUtils.insertBlock(srcWithTasks, section, newValue, "plugin2", "before");
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
        const section = "triggers";
        const key = "plugin1";
        const newValue = `
            id: plugin3
            type: type3
            name: Plugin 3
        `;
        const result = YamlUtils.insertBlock(srcWithTriggers, section, newValue, key);
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
        const srcWithSubTasks = `
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
        const result = YamlUtils.insertBlock(srcWithSubTasks, "tasks", newValue, undefined, "after", "t1");
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
        const srcWithTasksButNoSubTasks = `
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
        const result = YamlUtils.insertBlock(srcWithTasksButNoSubTasks, "tasks", newValue, undefined, "after", "t1");
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

    test("insert condition on trigger when no conditions section", () => {
        const srcWIthTriggers = `
        triggers:
        - id: trigger1
          type: type1
          name: Plugin 1
        `
        const result = YamlUtils.insertBlock(srcWIthTriggers, "triggers", newValue, undefined, "after", "trigger1", "id", "conditions");
        expect(result).toMatchInlineSnapshot(`
          "triggers:
            - id: trigger1
              type: type1
              name: Plugin 1
              conditions:
                - id: plugin3
                  type: type3
                  name: Plugin 3
          "
        `)
    })

    test("insert condition on trigger when conditions section present", () => {
        const srcWIthTriggers = `
        triggers:
        - id: trigger1
          type: type1
          name: Plugin 1
          conditions:
            - id: plugin2
              type: type2
              name: Plugin 2
        `
        const result = YamlUtils.insertBlock(srcWIthTriggers, "triggers", newValue, undefined, "after", "trigger1", "id", "conditions");
        expect(result).toMatchInlineSnapshot(`
          "triggers:
            - id: trigger1
              type: type1
              name: Plugin 1
              conditions:
                - id: plugin2
                  type: type2
                  name: Plugin 2
                - id: plugin3
                  type: type3
                  name: Plugin 3
          "
        `)
    })
})
