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

        const result = YamlUtils.extractBlock({
            source: yamlString, 
            section: "triggers", 
            key: "plugin1"
        });

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

        const result = YamlUtils.extractBlock({
            source: yamlString, 
            section: "tasks", 
            key: "plugin1"
        });

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

        const result = YamlUtils.extractBlock({
            source: yamlString, 
            section: "pluginDefaults", 
            key: "type1",
            keyName: "type",
        });

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

        const result = YamlUtils.swapBlocks({
            source: yamlString, 
            section: "triggers", 
            key1: "plugin1", 
            key2: "plugin2"
        });

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
               
        const result = YamlUtils.insertBlock({
            source: srcWithTasks, 
            section: "tasks", 
            newBlock: newValue, 
            refKey: "plugin1"
        });
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

        const result = YamlUtils.insertBlock({
            source: srcWithTriggers, 
            section: "tasks", 
            newBlock: newValue, 
            refKey: "plugin1"
        });;
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
        const result = YamlUtils.insertBlock({
            source: srcWithTasks, 
            section: "tasks", 
            newBlock: newValue, 
        });
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
        
        const result = YamlUtils.insertBlock({
            source: srcWithTasks, 
            section: "tasks", 
            newBlock: newValue, 
            position: "before"
        });
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
        const result = YamlUtils.insertBlock({
            source: srcWithTasks, 
            section: "tasks", 
            newBlock: newValue,
            refKey: "plugin2", 
            position: "before"
        });
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

    test("inserting before a trigger", () => {
        const srcWithTriggers = `
        triggers:
          - id: plugin1
            type: type1
            name: Plugin 1
          - id: plugin2
            type: type2
            name: Plugin 2
        `;
        const result = YamlUtils.insertBlock({
            source: srcWithTriggers, 
            section: "triggers", 
            newBlock: newValue,
            refKey: "plugin2", 
            position: "before"
        });
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
        const result = YamlUtils.insertBlock({
            source:srcWithSubTasks, 
            section: "tasks", 
            newBlock: newValue, 
            position:"after", 
            parentKey:"t1"
        });
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
        const result = YamlUtils.insertBlock({
            source: srcWithTasksButNoSubTasks, 
            section: "tasks", 
            newBlock: newValue, 
            position: "after", 
            parentKey: "t1"
        });
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
        const result = YamlUtils.insertBlock({
            source: srcWIthTriggers, 
            section: "triggers", 
            newBlock: newValue, 
            parentKey: "trigger1", 
            position: "after", 
            subBlockName: "conditions"
        });
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
        const result = YamlUtils.insertBlock({
            source: srcWIthTriggers, 
            section: "triggers", 
            newBlock: newValue, 
            parentKey: "trigger1", 
            position: "after", 
            subBlockName: "conditions"
        });
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
