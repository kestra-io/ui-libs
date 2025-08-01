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
          "
          tasks:
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
          "
          tasks:
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
          "
          tasks:
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
          "
          tasks:
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
          "
          triggers:
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
          "
          tasks:
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
          "
          triggers:
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

describe("deleteBlock", () => {
    test("deleting a trigger", () => {
        const yamlString = `
        triggers:
          - id: plugin1
            type: type1
            name: Plugin 1
          - id: plugin2
            type: type2
            name: Plugin 2
        `;
        const result = YamlUtils.deleteBlock({
            source: yamlString,
            section: "triggers",
            key: "plugin1"
        });
        expect(result).not.toContain("- id: plugin1");
    })

    test("deleting a task", () => {
        const yamlString = `
        tasks:
          - id: plugin1
            type: type1
            name: Plugin 1
          - id: plugin2
            type: type2
            name: Plugin 2
        `;
        const result = YamlUtils.deleteBlock({
            source: yamlString,
            section: "tasks",
            key: "plugin1"
        });
        expect(result).not.toContain("- id: plugin1");
    })

    test("deleting a task with subtask", () => {
        const yamlString = `
        tasks:
          - id: plugin1
            type: type1
            name: Plugin 1
            tasks:
              - id: plugin2
                type: type2
                name: Plugin 2
          - id: plugin3
            type: type3
            name: Plugin 3
        `;
        const result = YamlUtils.deleteBlock({
            source: yamlString,
            section: "tasks",
            key: "plugin1"
        });
        expect(result).not.toContain("- id: plugin1");
    })
    
    test("deleting a pluginDefaults", () => {
        const yamlString = `
        pluginDefaults:
          - type: type1
            name: Plugin 1
          - type: type2
            name: Plugin 2
        `;
        const result = YamlUtils.deleteBlock({
            source: yamlString,
            section: "pluginDefaults",
            key: "type1",
            keyName: "type"
        });
        expect(result).not.toContain("- type: type1");
    })

    test("deleting a pluginDefaults", () => {
        const yamlString = `
        pluginDefaults:
          - type: type1
            values:
              - going: nuts
              - going: bananas
                
          - type: type2
            name: Plugin 2
        `;
        const result = YamlUtils.deleteBlock({
            source: yamlString,
            section: "pluginDefaults",
            key: "type1",
            keyName: "type"
        });
        expect(result).not.toContain("- type: type1");
    })
})


describe("extractFieldFromMaps", () => {
    test("extracts field from maps", () => {
        const yamlSrc = `
            tasks:
              - id: task1
                type: io.kestra.plugin.core.log.Log
                labels:
                  key1: value1
                  key2: value2
              - id: task2
                type: io.kestra.plugin.core.log.Log
                labels:
                  key1: value3
                  key2: value4
            `;
            const result = YamlUtils.extractFieldFromMaps(yamlSrc, "labels");
            expect(result).toMatchInlineSnapshot(`
              [
                {
                  "labels": [
                    {
                      "key1": "value1",
                    },
                    {
                      "key2": "value2",
                    },
                  ],
                  "range": [
                    36,
                    184,
                    184,
                  ],
                },
                {
                  "labels": [
                    {
                      "key1": "value3",
                    },
                    {
                      "key2": "value4",
                    },
                  ],
                  "range": [
                    200,
                    348,
                    348,
                  ],
                },
              ]
            `);
            })

    test("returns empty object if field not found", () => {
        const yaml = `
        tasks:
          - id: task1
            type: io.kestra.plugin.core.log.Log
        `;
        const result = YamlUtils.extractFieldFromMaps(yaml, "labels");
        expect(result).toEqual([]);
    });
    test("returns empty object if no maps found", () => {
        const yaml = `
        tasks:
          - id: task1
            type: io.kestra.plugin.core.log.Log
        `;
        const result = YamlUtils.extractFieldFromMaps(yaml, "labels");
        expect(result).toEqual([]);
    });
    test("extract fields given keepEmptyFields equals true", () => {
        const yaml = `
        tasks:
          - id: task1
            type: io.kestra.plugin.core.log.Log
            version: 0.0.1
          - id: task2
            type: io.kestra.plugin.core.log.Log
          - id: task3
            type: io.kestra.plugin.core.log.Log
            version: 0.0.2
        `;
        const result = YamlUtils.extractFieldFromMaps(yaml, "version", () => true, () => true, true);
        expect(result).toMatchInlineSnapshot(`
            [
              {
                "range": [
                  9,
                  280,
                  280,
                ],
                "version": undefined,
              },
              {
                "range": [
                  28,
                  113,
                  113,
                ],
                "version": "0.0.1",
              },
              {
                "range": [
                  125,
                  183,
                  183,
                ],
                "version": undefined,
              },
              {
                "range": [
                  195,
                  280,
                  280,
                ],
                "version": "0.0.2",
              },
            ]
        `);
    })
})

describe("getLastBlock", () => {
    test("get last task", () => {
        const yamlString = `
        tasks:
          - id: plugin1
            type: type1
            name: Plugin 1
          - id: plugin2
            type: type2
            name: Plugin 2
        `;
        const result = YamlUtils.getLastBlock({
            source: yamlString,
            section: "tasks"
        });
        expect(result).toBe("plugin2");
    })

    test("get last trigger", () => {
        const yamlString = `
        tasks:
          - id: plugin1
            type: type1
            name: Plugin 1
        triggers:
          - id: plugin1
            type: trigger1
            name: Trigger 1
          - id: plugin2
            type: trigger2
            name: Trigger 2
        `;
        const result = YamlUtils.getLastBlock({
            source: yamlString,
            section: "triggers"
        });
        expect(result).toBe("plugin2");
    })

    test("get last pluginDefaults", () => {
        const yamlString = `
        tasks:
          - id: plugin1
            type: type1
            name: Plugin 1
        pluginDefaults:
          - type: type1
            name: Plugin Default 1
          - type: type2
            name: Plugin Default 2
        `;
        const result = YamlUtils.getLastBlock({
            source: yamlString,
            section: "pluginDefaults",
            keyName: "type"
        });
        expect(result).toBe("type2");
    })

    test("get last subtask", () => {
        const yamlString = `
        tasks:
          - id: plugin1
            type: type1
            name: Plugin 1
            tasks:
              - id: plugin2
                type: type2
                name: Plugin 2
              - id: plugin3
                type: type3
                name: Plugin 3
        `;
        const result = YamlUtils.getLastBlock({
            source: yamlString,
            section: "tasks",
            parentKey: "plugin1"
        });
        expect(result).toBe("plugin3");
    })

    test("get last condition in trigger", () => {
        const yamlString = `
        triggers:
          - id: plugin1
            type: trigger1
            name: Trigger 1
            conditions:
              - id: plugin2
                type: condition1
                name: Condition 1
              - id: plugin3
                type: condition2
                name: Condition 2
        `;
        const result = YamlUtils.getLastBlock({
            source: yamlString,
            section: "triggers",
            parentKey: "plugin1",
            subBlockName: "conditions"
        });
        expect(result).toBe("plugin3");
    })
})

describe("insertBlockWithPath", () => {
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
               
        const result = YamlUtils.insertBlockWithPath({
            source: srcWithTasks, 
            parentPath: "tasks", 
            newBlock: newValue, 
            refPath: 0,
            position: "after"
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

        const result = YamlUtils.insertBlockWithPath({
            source: srcWithTriggers, 
            parentPath: "tasks",
            newBlock: newValue, 
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

    test("inserting a task as a subBlock of another task", () => {
        const srcWithSubTasks = `
        tasks:
          - id: plugin1
            type: type1
            name: Plugin 1
            tasks:
              - id: plugin2
                type: type2
                name: Plugin 2
              - id: plugin5
                type: type5
                name: Plugin 5
          - id: plugin3
            type: type3
            name: Plugin 3
        `;
        const newValue = `
            id: plugin4
            type: type4
            name: Plugin 4
        `;
        const result = YamlUtils.insertBlockWithPath({
            source: srcWithSubTasks, 
            newBlock: newValue, 
            parentPath: "tasks[0].tasks",
            refPath: 0,
            position: "before"
        });
        expect(result).toMatchInlineSnapshot(`
          "tasks:
            - id: plugin1
              type: type1
              name: Plugin 1
              tasks:
                - id: plugin4
                  type: type4
                  name: Plugin 4
                - id: plugin2
                  type: type2
                  name: Plugin 2
                - id: plugin5
                  type: type5
                  name: Plugin 5
            - id: plugin3
              type: type3
              name: Plugin 3
          "
        `)
    })

    test("inserting a condition on a trigger", () => {
        const srcWithTriggers = `
        triggers:
          - id: plugin1
            type: type1
            name: Plugin 1
          - id: plugin2
            type: type2
            name: Plugin 2
        `;

        const result = YamlUtils.insertBlockWithPath({
            source: srcWithTriggers, 
            parentPath: "triggers[0].conditions",
            newBlock: newValue, 
        });;
        expect(result).toMatchInlineSnapshot(`
          "triggers:
            - id: plugin1
              type: type1
              name: Plugin 1
              conditions:
                - id: plugin3
                  type: type3
                  name: Plugin 3
            - id: plugin2
              type: type2
              name: Plugin 2
          "
        `)
    })
})

describe("deleteBlockWithPath", () => {
    test("deleting a trigger", () => {
        const yamlString = `
        triggers:
          - id: plugin1
            type: type1
            name: Plugin 1
          - id: plugin2
            type: type2
            name: Plugin 2
        `;
        const result = YamlUtils.deleteBlockWithPath({
            source: yamlString,
            path: "triggers[0]"
        });
        expect(result).not.toContain("- id: plugin1");
    })

    test("deleting a task", () => {
        const yamlString = `
        tasks:
          - id: plugin1
            type: type1
            name: Plugin 1
          - id: plugin2
            type: type2
            name: Plugin 2
        `;
        const result = YamlUtils.deleteBlockWithPath({
            source: yamlString,
            path: "tasks[1]",
        });
        expect(result).not.toContain("- id: plugin2");
    })

    test("deleting a task with subtask", () => {
        const yamlString = `
        tasks:
          - id: plugin1
            type: type1
            name: Plugin 1
            tasks:
              - id: plugin2
                type: type2
                name: Plugin 2
          - id: plugin3
            type: type3
            name: Plugin 3
        `;
        const result = YamlUtils.deleteBlockWithPath({
            source: yamlString,
            path:"tasks[0].tasks[0]",
        });
        expect(result).not.toContain("- id: plugin2");
    })
    
    test("deleting a pluginDefaults", () => {
        const yamlString = `
        pluginDefaults:
          - type: type1
            name: Plugin 1
          - type: type2
            name: Plugin 2
        `;
        const result = YamlUtils.deleteBlockWithPath({
            source: yamlString,
            path:"pluginDefaults[0]",
        });
        expect(result).not.toContain("- type: type1");
    })

    test("deleting a section when empty", () => {
        const yamlString = `
        tasks:
          - type: type1
            name: Plugin 1
        `;
        const result = YamlUtils.deleteBlockWithPath({
            source: yamlString,
            path:"tasks[0]",
        });
        expect(result).not.toContain("tasks:");
    })

})

describe("extractBlockWithPath", () => {
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

        const result = YamlUtils.extractBlockWithPath({
            source: yamlString,
            path: "triggers[1]",
        })
        expect(result).toMatchInlineSnapshot(`
          "id: plugin2
          type: type2
          name: Plugin 2
          "
        `);
    })
    test("extracting a sub-subtask", () => {
        const yamlString = `
        tasks:
          - id: plugin1
            type: type1
            name: Plugin 1
            tasks:
              - id: plugin2
                type: type2
                name: Plugin 2
              - id: plugin3
                type: type3
                name: Plugin 3
                tasks:
                  - id: plugin4
                    type: type4
                    name: Plugin 4
                  - id: plugin5
                    type: type5
                    name: Plugin 5
        `;

        const result = YamlUtils.extractBlockWithPath({
            source: yamlString,
            path: "tasks[0].tasks[1].tasks[0]",
        })
        expect(result).toMatchInlineSnapshot(`
          "id: plugin4
          type: type4
          name: Plugin 4
          "
          `)
    })
})

describe("replaceBlockWithPath", () => {
    test("replacing a trigger", () => {
        const yamlString = `
        triggers:
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

        const result = YamlUtils.replaceBlockWithPath({
            source: yamlString,
            path: "triggers[1]",
            newContent: newValue
        })
        expect(result).toMatchInlineSnapshot(`
          "triggers:
            - id: plugin1
              type: type1
              name: Plugin 1
            - id: plugin3
              type: type3
              name: Plugin 3
          "
        `);
    })

    test("replacing a task", () => {
        const yamlString = `
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

        const result = YamlUtils.replaceBlockWithPath({
            source: yamlString, 
            path: "tasks[1]",
            newContent: newValue
        })
        expect(result).toMatchInlineSnapshot(`
          "tasks:
            - id: plugin1
              type: type1
              name: Plugin 1
            - id: plugin3
              type: type3
              name: Plugin 3
          "
        `)
    })

    test("replacing a task with subtask", () => {
        const yamlString = `
        tasks:
          - id: plugin1
            type: type1
            name: Plugin 1
            tasks:
              - id: plugin2
                type: type2
                name: Plugin 2
              - id: plugin3
                type: type3
                name: Plugin 3
        `;

        const newValue = `
        id: plugin4
        type: type4
        name: Plugin 4
        `;

        const result = YamlUtils.replaceBlockWithPath({
            source: yamlString,
            path: "tasks[0].tasks[1]",
            newContent: newValue    
        })
        expect(result).toMatchInlineSnapshot(`
          "tasks:
            - id: plugin1
              type: type1
              name: Plugin 1
              tasks:
                - id: plugin2
                  type: type2
                  name: Plugin 2
                - id: plugin4
                  type: type4
                  name: Plugin 4
          "
        `)
    })

    test("replace a condition in a trigger", () => {
        const yamlString = `
        triggers:
          - id: plugin1
            type: type1
            name: Plugin 1
            conditions:
              - id: plugin2
                type: type2
                name: Plugin 2
              - id: plugin3
                type: type3
                name: Plugin 3
        `;

        const newValue = `
        id: plugin4
        type: type4
        name: Plugin 4
        `;

        const result = YamlUtils.replaceBlockWithPath({
            source: yamlString,
            path: "triggers[0].conditions[1]",
            newContent: newValue
        })
        expect(result).toMatchInlineSnapshot(`
          "triggers:
            - id: plugin1
              type: type1
              name: Plugin 1
              conditions:
                - id: plugin2
                  type: type2
                  name: Plugin 2
                - id: plugin4
                  type: type4
                  name: Plugin 4
          "
        `)
    })

    test("replace a subtask with subtask", () => {
        const yamlString = `
tasks:
  - id: test
    type: io.kestra.plugin.core.flow.Dag
    tasks:
      - dependsOn:
          - tweeb
        task:
          id: foo
          type: io.kestra.plugin.core.log.Log
          message: foow
      - task:
          id: tweeb
          type: io.kestra.plugin.core.log.Log
          message: tweeb
`;

        const newValue = `
            id: plugin4
            type: type4
            name: Plugin 4
        `;

        const result = YamlUtils.replaceBlockWithPath({
            source: yamlString,
            path: "tasks[0].tasks[2].task",
            newContent: newValue
        })

        expect(result).toMatchInlineSnapshot(`
          "tasks:
            - id: test
              type: io.kestra.plugin.core.flow.Dag
              tasks:
                - dependsOn:
                    - tweeb
                  task:
                    id: foo
                    type: io.kestra.plugin.core.log.Log
                    message: foow
                - task:
                    id: tweeb
                    type: io.kestra.plugin.core.log.Log
                    message: tweeb
                - task:
                    id: plugin4
                    type: type4
                    name: Plugin 4
          "
        `)
    })
})

describe("getPathFromSectionAndId", () => {  
    test("get path from id", () => {
        const yamlString = `
        tasks:
          - id: plugin1
            type: type1
            name: Plugin 1
          - id: plugin2
            type: type2
            name: Plugin 2
        `;
        const result = YamlUtils.getPathFromSectionAndId({
            source: yamlString,
            section: "tasks",
            id: "plugin2"
        });
        expect(result).toBe("tasks[1]");
    })

    test("get path from id with subtask", () => {
        const yamlString = `
        tasks:
          - id: plugin1
            type: type1
            name: Plugin 1
            tasks:
              - id: plugin2
                type: type2
                name: Plugin 2
              - id: plugin3
                type: type3
                name: Plugin 3
        `;
        const result = YamlUtils.getPathFromSectionAndId({
            source: yamlString,
            section: "tasks",
            id: "plugin3"
        });
        expect(result).toBe("tasks[0].tasks[1]");
    })

    test("get path from id with subCondition", () => {
        const yamlString = `
        triggers:
          - id: plugin1
            type: type1
            name: Plugin 1
            conditions:
              - id: plugin2
                type: type2
                name: Plugin 2
              - id: plugin3
                type: type3
                name: Plugin 3
          - id: plugin4
            type: type4
            name: Plugin 4
        
        `;
        const result = YamlUtils.getPathFromSectionAndId({
            source: yamlString,
            section: "triggers",
            id: "plugin3"
        });
        expect(result).toBe("triggers[0].conditions[1]");
    })

    test("get path from dag", () => {
        const yamlString = `
            tasks:
              - dependency: t1
                task:
                    id: t2
                    type: type2
                    name: Plugin 2
              - task:
                    id: t3
                    type: type3
                    name: Plugin 3
        
        `;
        const result = YamlUtils.getPathFromSectionAndId({
            source: yamlString,
            section: "tasks",
            id: "t2"
        });
        expect(result).toBe("tasks[0].task");
    })
})

describe("replaceIdAndNamespace", () => {
    test("replaces id and namespace in yaml", () => {
        const yaml = `
id: old-id
namespace: old.namespace
tasks:
  - id: task1
        `;
        const result = YamlUtils.replaceIdAndNamespace(yaml, "new-id", "new.namespace");
        expect(result).toContain("id: new-id");
        expect(result).toContain("namespace: new.namespace");
    });

    test("handles quoted values", () => {
        const yaml = `
id: "old-id"
namespace: 'old.namespace'
        `;
        const result = YamlUtils.replaceIdAndNamespace(yaml, "new-id", "new.namespace");
        expect(result).toContain("id: \"new-id\"");
        expect(result).toContain("namespace: 'new.namespace'");
    });

    test("handles yaml with only tasks and sets it on top", () => {
        const yaml = `
tasks: 
  - id: t1
    type: plugin1
        `;
        const result = YamlUtils.replaceIdAndNamespace(yaml, "new-id", "new.namespace");
        const lines = result.split("\n").map((l: string) => l.trim()).filter(Boolean);
        expect(result).toContain("id: new-id");
        expect(lines[0]).toBe("id: new-id");
        expect(result).toContain("namespace: new.namespace");
    });

    test("handles empty yaml", () => {
        const yaml = `

        `;
        const result = YamlUtils.replaceIdAndNamespace(yaml, "new-id", "new.namespace");
        expect(result).toContain("id: new-id");
        expect(result).toContain("namespace: new.namespace");
    });
});

describe("getMetadata", () => {
    test("returns all metadata except tasks, triggers, and errors", () => {
        const yaml = `
        id: test
        namespace: test.ns
        description: Test flow

        tasks:
          - id: task1
        triggers:
          - id: trigger1
        errors:
          - id: error1
        finally:
          - id: finally1
        `;
        const metadata = YamlUtils.getMetadata(yaml);
        expect(metadata).toEqual({
            id: "test",
            namespace: "test.ns",
            description: "Test flow"
        });
    });

    test("handles complex metadata values", () => {
        const yaml = `
        id: test
        labels:
          env: prod
          team: dev
        variables:
          var1: value1
        `;
        const metadata = YamlUtils.getMetadata(yaml);
        expect(metadata).toEqual({
            id: "test",
            labels: {
                env: "prod",
                team: "dev"
            },
            variables: {
                var1: "value1"
            }
        });
    });

    test("does not fail on empty yaml", () => {
        const yaml = "";
        const metadata = YamlUtils.getMetadata(yaml);
        expect(metadata).toEqual({});
    })
});

describe("cleanMetadata", () => {
    test("removes empty sections", () => {
        const yaml = `
        id: test
        tasks: []
        triggers: []
        errors: []
        `;
        const result = YamlUtils.cleanMetadata(yaml);
        expect(result).toBe("id: test\n");
    });

    test("maintains correct order of sections", () => {
        const yaml = `
        tasks:
          - id: task1
        namespace: test
        id: test
        triggers:
          - id: trigger1
        `;
        const result = YamlUtils.cleanMetadata(yaml);
        const lines = result.split("\n").map((l: string) => l.trim()).filter(Boolean);
        expect(lines[0]).toBe("id: test");
        expect(lines[1]).toBe("namespace: test");
    });
});

describe("get lines infos", () => {
    test("get tasks lines", () => {
        const yamlString = `# this count as an empty line
        tasks:
          - id: plugin1
            type: type1
            name: Plugin 1
            extrafield: Extra field 1
          - id: plugin2
            type: type2
            name: Plugin 2
        `;

        const tasksLines = YamlUtils.getTasksLines(yamlString);
        expect(tasksLines).to.containSubset({plugin1: {start: 3, end: 6}});
        expect(tasksLines).to.containSubset({plugin2: {start: 7, end: 9}});
    })
    test("get tasks lines including comments and line breaks", () => {
        const yamlString = `# this count as an empty line
        # second comment
        tasks:
            # third comment
          - id: plugin1
            type: type1
            # fourth comment
            name: Plugin 1
            
            
            # end comment
        `;

        const tasksLines = YamlUtils.getTasksLines(yamlString);
        expect(tasksLines).to.containSubset({plugin1: {start: 5, end: 8}});
    })
    test("get tasks lines including multiline field", () => {
        const yamlString = `# this count as an empty line
        tasks:
          - id: plugin1
            type: type1
            name: Plugin 1
            payload: |
              {
                "text": "Failure alert for flow {{ flow.namespace }}.{{ flow.id }} with ID {{ execution.id }}"
              }
         # end comment     
        `;

        const tasksLines = YamlUtils.getTasksLines(yamlString);
        expect(tasksLines).to.containSubset({plugin1: {start: 3, end: 9}});
    })
    test("get tasks lines for 'Dag' tasks", () => {
        const yamlString = `# this count as an empty line
        tasks:
          - id: log_task
            type: io.kestra.plugin.core.log.Log
            message: 'log msg'
          - id: dag_task
            type: io.kestra.plugin.core.flow.Dag
            tasks:
              - task:
                  id: nested_task_1_inside_dag
                  type: io.kestra.plugin.core.log.Log
                  message: test1
              - task:
                  id: nested_task_2_inside_dag
                  type: io.kestra.plugin.core.log.Log
                  message: test2
        `;

        const tasksLines = YamlUtils.getTasksLines(yamlString);
        expect(tasksLines).to.containSubset({dag_task: {start: 6, end: 16}});
        expect(tasksLines).to.containSubset({nested_task_1_inside_dag: {start: 10, end: 12}});
        expect(tasksLines).to.containSubset({nested_task_2_inside_dag: {start: 14, end: 16}});
    })
    test("get tasks lines for 'Foreach' tasks", () => {
        const yamlString = `# this count as an empty line
        tasks:
          - id: for_each_task
            type: io.kestra.plugin.core.flow.ForEach
            values:
              - value 1
            tasks:
              - id: for_each_task_1
                type: io.kestra.plugin.core.log.Log
                message: test1
        `;

        const tasksLines = YamlUtils.getTasksLines(yamlString);
        expect(tasksLines).to.containSubset({for_each_task: {start: 3, end: 10}});
        expect(tasksLines).to.containSubset({for_each_task_1: {start: 8, end: 10}});
    })
    test("get tasks lines for nested 'Foreach' tasks", () => {
        const yamlString = `# this count as an empty line
        tasks:
          - id: for_each
            type: io.kestra.plugin.core.flow.ForEach
            values:
              - value 1
            tasks:
              - id: for_each_task_1
                type: io.kestra.plugin.core.log.Log
                message: test1
              - id: nested_foreach
                type: io.kestra.plugin.core.flow.ForEach
                values:
                    - value 2
                tasks:
                  - id: nested_foreach_task1
                    type: io.kestra.plugin.core.log.Log
                    message: test2
        `;

        const tasksLines = YamlUtils.getTasksLines(yamlString);
        expect(tasksLines).to.containSubset({for_each: {start: 3, end: 18}});
        expect(tasksLines).to.containSubset({for_each_task_1: {start: 8, end: 10}});
        expect(tasksLines).to.containSubset({nested_foreach: {start: 11, end: 18}});
        expect(tasksLines).to.containSubset({nested_foreach_task1: {start: 16, end: 18}});
    })
    test("get tasks lines for 'Condition' task", () => {
        const yamlString = `# this count as an empty line
        tasks:
          - id: if_task
            type: io.kestra.plugin.core.flow.If
            condition: "{{ inputs.string == 'Condition' }}"
            then:
              - id: when_true
                type: io.kestra.plugin.core.log.Log
                message: "Condition was true"
            else:
              - id: when_false
                type: io.kestra.plugin.core.log.Log
                message: "Condition was false"
        `;

        const tasksLines = YamlUtils.getTasksLines(yamlString);
        expect(tasksLines).to.containSubset({if_task: {start: 3, end: 13}});
        expect(tasksLines).to.containSubset({when_true: {start: 7, end: 9}});
        expect(tasksLines).to.containSubset({when_false: {start: 11, end: 13}});
    })
    test("if a task ends on the last line, it should be included", () => {
        const yamlString = `# this count as an empty line
        tasks:
          - id: plugin1
            type: type1
            name: Plugin 1
            extrafield: Extra field 1`;

        const tasksLines = YamlUtils.getTasksLines(yamlString);
        expect(tasksLines).to.containSubset({plugin1: {start: 3, end: 6}});
    })
});