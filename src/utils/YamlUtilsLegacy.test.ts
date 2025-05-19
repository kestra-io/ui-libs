import {test, expect, describe} from "vitest";
import {YamlUtils} from "./YamlUtilsLegacy";
import yaml from "yaml";

const yamlString = `
    id: full
    namespace: io.kestra.tests
    labels:
        key1: value1
        key2: value2

    tasks:
      - id: t1
        type: io.kestra.plugin.core.log.Log
        message: "{{ task.id }}"

      - id: t2
        type: io.kestra.plugin.core.debug.Return
        format: second {{ labels.key1 }}

    triggers:
      - id: schedule1
        type: schedule
        expression: 42 4 1 * *
        backfill:
          start: 2018-01-01
          depend-on-past: false

    errors:
      - id: alert_on_failure
        type: io.kestra.plugin.notifications.slack.SlackIncomingWebhook
        url: secret('SLACK_WEBHOOK')
        payload: |
            {
                "channel": "#alerts",
                "text": "Failure alert for flow {{ flow.namespace }}.{{ flow.id }} with ID {{ execution.id }}"
            }
    `;

test("parse", () => {
    expect(() => YamlUtils.parse(undefined)).not.toThrow();
    expect(() => YamlUtils.parse(yamlString)).not.toThrow();
    expect(() => YamlUtils.parse("invalid: yaml: tests", false)).not.toThrow();
    expect(() => YamlUtils.parse("invalid: yaml: tests", true)).toThrow();
})

describe("insertTask", () => {
    test("after", () => {
        const newTask = {
            id: "t1.1",
            name: "newTask",
            command: "echo hello",
            args: ["arg1", "arg2"],
            env: {ENV_VAR: "value"},
            cwd: "/path/to/dir",
        };

        const updatedYaml = YamlUtils.insertTask(yamlString, "t1", YamlUtils.stringify(newTask), "after");
        expect(updatedYaml).toContain("- id: t1.1");
        expect(updatedYaml.indexOf("- id: t1.1")).toBeGreaterThan(updatedYaml.indexOf("- id: t1"));
        expect(updatedYaml).toMatchInlineSnapshot(`
          "id: full
          namespace: io.kestra.tests
          labels:
            key1: value1
            key2: value2

          tasks:
            - id: t1
              type: io.kestra.plugin.core.log.Log
              message: "{{ task.id }}"
            - id: t1.1
              name: newTask
              command: echo hello
              args:
                - arg1
                - arg2
              env:
                ENV_VAR: value
              cwd: /path/to/dir

            - id: t2
              type: io.kestra.plugin.core.debug.Return
              format: second {{ labels.key1 }}

          triggers:
            - id: schedule1
              type: schedule
              expression: 42 4 1 * *
              backfill:
                start: 2018-01-01
                depend-on-past: false

          errors:
            - id: alert_on_failure
              type: io.kestra.plugin.notifications.slack.SlackIncomingWebhook
              url: secret('SLACK_WEBHOOK')
              payload: |
                {
                    "channel": "#alerts",
                    "text": "Failure alert for flow {{ flow.namespace }}.{{ flow.id }} with ID {{ execution.id }}"
                }
          "
        `)
    })

    test("before", () => {
        const newTask = {
            id: "t0",
            name: "newTask",
            command: "echo hello",
            args: ["arg1", "arg2"],
            env: {ENV_VAR: "value"},
            cwd: "/path/to/dir",
        };

        const updatedYaml = YamlUtils.insertTask(yamlString, "t1", YamlUtils.stringify(newTask), "before");
        expect(updatedYaml).toContain("- id: t0");
        expect(updatedYaml.indexOf("- id: t0")).toBeLessThan(updatedYaml.indexOf("- id: t1"));
        expect(updatedYaml).toMatchInlineSnapshot(`
          "id: full
          namespace: io.kestra.tests
          labels:
            key1: value1
            key2: value2

          tasks:
            - id: t0
              name: newTask
              command: echo hello
              args:
                - arg1
                - arg2
              env:
                ENV_VAR: value
              cwd: /path/to/dir
            - id: t1
              type: io.kestra.plugin.core.log.Log
              message: "{{ task.id }}"

            - id: t2
              type: io.kestra.plugin.core.debug.Return
              format: second {{ labels.key1 }}

          triggers:
            - id: schedule1
              type: schedule
              expression: 42 4 1 * *
              backfill:
                start: 2018-01-01
                depend-on-past: false

          errors:
            - id: alert_on_failure
              type: io.kestra.plugin.notifications.slack.SlackIncomingWebhook
              url: secret('SLACK_WEBHOOK')
              payload: |
                {
                    "channel": "#alerts",
                    "text": "Failure alert for flow {{ flow.namespace }}.{{ flow.id }} with ID {{ execution.id }}"
                }
          "
        `)
    })

    test("insert in empty sub tasks", () => {
        const newTask1 = {
            id: "t0-added-1",
            type: "io.kestra.plugin.core.log.Log",
            message: "newTask",
        };

        

        const updatedYaml = YamlUtils.insertTask(yamlString, "", YamlUtils.stringify(newTask1), "after", "t1");
        expect(updatedYaml).toContain("t0-added-1");  
    })

    test("insert subtasks after", () => {
        const subTask = {
            id: "t1-added-1",
            type: "io.kestra.plugin.core.log.Log",
            message: "newTask",
        };

        const addedSubTask = {
            ...subTask,
            id: "t1-added-2",
        }

        const updatedYaml = YamlUtils.insertTask(yamlString, "", YamlUtils.stringify(subTask), "after", "t1");
        const finalYaml = YamlUtils.insertTask(updatedYaml, "t1-added-1", YamlUtils.stringify(addedSubTask), "after", "t1");
        expect(finalYaml).toContain("t1-added-2");
        expect(finalYaml.indexOf("t1-added-2")).toBeGreaterThan(updatedYaml.indexOf("t1-added-1"));
    })

    test("insert subtasks before", () => {
        const subTask = {
            id: "t1-added-1",
            type: "io.kestra.plugin.core.log.Log",
            message: "newTask",
        };

        const addedSubTask = {
            ...subTask,
            id: "t1-added-0",
        }

        const updatedYaml = YamlUtils.insertTask(yamlString, "", YamlUtils.stringify(subTask), "before", "t1");
        const finalYaml = YamlUtils.insertTask(updatedYaml, "t1-added-1", YamlUtils.stringify(addedSubTask), "before", "t1");
        expect(finalYaml).toContain("t1-added-0");
        expect(finalYaml.indexOf("t1-added-0")).toBeLessThan(finalYaml.indexOf("t1-added-1"));
        expect(finalYaml).toMatchInlineSnapshot(`
          "id: full
          namespace: io.kestra.tests
          labels:
            key1: value1
            key2: value2

          tasks:
            - id: t1
              type: io.kestra.plugin.core.log.Log
              message: "{{ task.id }}"
              tasks:
                - id: t1-added-0
                  type: io.kestra.plugin.core.log.Log
                  message: newTask
                - id: t1-added-1
                  type: io.kestra.plugin.core.log.Log
                  message: newTask

            - id: t2
              type: io.kestra.plugin.core.debug.Return
              format: second {{ labels.key1 }}

          triggers:
            - id: schedule1
              type: schedule
              expression: 42 4 1 * *
              backfill:
                start: 2018-01-01
                depend-on-past: false

          errors:
            - id: alert_on_failure
              type: io.kestra.plugin.notifications.slack.SlackIncomingWebhook
              url: secret('SLACK_WEBHOOK')
              payload: |
                {
                    "channel": "#alerts",
                    "text": "Failure alert for flow {{ flow.namespace }}.{{ flow.id }} with ID {{ execution.id }}"
                }
          "
        `)
    })
})

test("insertSection", () => {
    const newTask = {
        id: "newSection",
        name: "newSection",
        description: "This is a new section",
        tasks: [],
    };
    const updatedYaml = YamlUtils.insertSection("finally", yamlString, YamlUtils.stringify(newTask));
    expect(updatedYaml).toMatchInlineSnapshot(`
      "id: full
      namespace: io.kestra.tests
      labels:
        key1: value1
        key2: value2

      tasks:
        - id: t1
          type: io.kestra.plugin.core.log.Log
          message: "{{ task.id }}"

        - id: t2
          type: io.kestra.plugin.core.debug.Return
          format: second {{ labels.key1 }}

      triggers:
        - id: schedule1
          type: schedule
          expression: 42 4 1 * *
          backfill:
            start: 2018-01-01
            depend-on-past: false

      errors:
        - id: alert_on_failure
          type: io.kestra.plugin.notifications.slack.SlackIncomingWebhook
          url: secret('SLACK_WEBHOOK')
          payload: |
            {
                "channel": "#alerts",
                "text": "Failure alert for flow {{ flow.namespace }}.{{ flow.id }} with ID {{ execution.id }}"
            }
      finally:
        - id: newSection
          description: This is a new section
          tasks: []
          name: newSection
      "
    `)
})

describe("deleteTask", () => {
    test("delete task", () => {
        const updatedYaml = YamlUtils.deleteTask(yamlString, "t1", "TASKS");
        expect(updatedYaml).toMatchInlineSnapshot(`
          "id: full
          namespace: io.kestra.tests
          labels:
            key1: value1
            key2: value2

          tasks:

            - id: t2
              type: io.kestra.plugin.core.debug.Return
              format: second {{ labels.key1 }}

          triggers:
            - id: schedule1
              type: schedule
              expression: 42 4 1 * *
              backfill:
                start: 2018-01-01
                depend-on-past: false

          errors:
            - id: alert_on_failure
              type: io.kestra.plugin.notifications.slack.SlackIncomingWebhook
              url: secret('SLACK_WEBHOOK')
              payload: |
                {
                    "channel": "#alerts",
                    "text": "Failure alert for flow {{ flow.namespace }}.{{ flow.id }} with ID {{ execution.id }}"
                }
          "
        `)
    })

    test("delete trigger", () => {
        const updatedYaml = YamlUtils.deleteTask(yamlString, "schedule1", "TRIGGERS");
        expect(updatedYaml).toMatchInlineSnapshot(`
          "id: full
          namespace: io.kestra.tests
          labels:
            key1: value1
            key2: value2

          tasks:
            - id: t1
              type: io.kestra.plugin.core.log.Log
              message: "{{ task.id }}"

            - id: t2
              type: io.kestra.plugin.core.debug.Return
              format: second {{ labels.key1 }}

          errors:
            - id: alert_on_failure
              type: io.kestra.plugin.notifications.slack.SlackIncomingWebhook
              url: secret('SLACK_WEBHOOK')
              payload: |
                {
                    "channel": "#alerts",
                    "text": "Failure alert for flow {{ flow.namespace }}.{{ flow.id }} with ID {{ execution.id }}"
                }
          "
        `)
    })

    test("delete error as tasks", () => {
        const updatedYaml = YamlUtils.deleteTask(yamlString, "alert_on_failure", "TASKS");
        expect(updatedYaml).toMatchInlineSnapshot(`
          "id: full
          namespace: io.kestra.tests
          labels:
            key1: value1
            key2: value2

          tasks:
            - id: t1
              type: io.kestra.plugin.core.log.Log
              message: "{{ task.id }}"

            - id: t2
              type: io.kestra.plugin.core.debug.Return
              format: second {{ labels.key1 }}

          triggers:
            - id: schedule1
              type: schedule
              expression: 42 4 1 * *
              backfill:
                start: 2018-01-01
                depend-on-past: false
          "
        `)
    })

    test("delete error as errors does not work", () => {
        const updatedYaml = YamlUtils.deleteTask(yamlString, "alert_on_failure", "ERRORS");
        expect(updatedYaml).toMatchInlineSnapshot(`
          "id: full
          namespace: io.kestra.tests
          labels:
            key1: value1
            key2: value2

          tasks:
            - id: t1
              type: io.kestra.plugin.core.log.Log
              message: "{{ task.id }}"

            - id: t2
              type: io.kestra.plugin.core.debug.Return
              format: second {{ labels.key1 }}

          triggers:
            - id: schedule1
              type: schedule
              expression: 42 4 1 * *
              backfill:
                start: 2018-01-01
                depend-on-past: false

          errors:
            - id: alert_on_failure
              type: io.kestra.plugin.notifications.slack.SlackIncomingWebhook
              url: secret('SLACK_WEBHOOK')
              payload: |
                {
                    "channel": "#alerts",
                    "text": "Failure alert for flow {{ flow.namespace }}.{{ flow.id }} with ID {{ execution.id }}"
                }
          "
        `)
    })
})

// ...existing code...

describe("getAllCharts", () => {
    test("returns empty array when no charts present", () => {
        const yaml = `
        id: test
        namespace: test
        tasks: []
        `;
        expect(YamlUtils.getAllCharts(yaml)).toEqual([]);
    });

    test("returns all charts from yaml", () => {
        const yaml = `
        id: test
        charts:
          - type: line
            title: "Chart 1"
            data: [1, 2, 3]
          - type: bar
            title: "Chart 2"
            data: [4, 5, 6]
        `;
        const charts = YamlUtils.getAllCharts(yaml);
        expect(charts).toHaveLength(2);
        expect(charts[0]).toEqual({
            type: "line",
            title: "Chart 1",
            data: [1, 2, 3]
        });
    });
});

describe("getChartAtPosition", () => {
    test("returns null when no chart at position", () => {
        const yaml = `
        id: test
        tasks: []
        `;
        expect(YamlUtils.getChartAtPosition(yaml, {lineNumber: 2, column: 1})).toBeNull();
    });

    test("returns chart at specified position", () => {
        const yaml = `
        charts:
          - type: line
            title: "Chart 1"
          - type: bar
            title: "Chart 2"
        `.trim();
        const chart = YamlUtils.getChartAtPosition(yaml, {lineNumber: 3, column: 5});
        expect(chart).toEqual({
            type: "line",
            title: "Chart 1"
        });
    });
});

describe("swapTasks", () => {
    test("swaps two tasks positions", () => {
        const yaml = `
        tasks:
          - id: task1
            type: test1
          - id: task2
            type: test2
        `;
        const result = YamlUtils.swapTasks(yaml, "task1", "task2");
        expect(result).toContain("  - id: task2\n    type: test2");
        expect(result).toContain("  - id: task1\n    type: test1");
    });

    test("throws error when task is dependency", () => {
        const yaml = `
        tasks:
          - id: task1
            type: test1
            dependsOn: ["task2"]
          - id: task2
            type: test2
        `;
        expect(() => YamlUtils.swapTasks(yaml, "task1", "task2")).toThrow();
    });
});

describe("isParentChildrenRelation", () => {
    test("returns true when tasks have parent-child relationship", () => {
        const yaml = `
        tasks:
          - id: parent
            type: parallel
            tasks:
              - id: child
                type: test
        `;
        expect(YamlUtils.isParentChildrenRelation(yaml, "parent", "child")).toBe(true);
    });

    test("returns false when tasks have no relation", () => {
        const yaml = `
        tasks:
          - id: task1
            type: test1
          - id: task2
            type: test2
        `;
        expect(YamlUtils.isParentChildrenRelation(yaml, "task1", "task2")).toBe(false);
    });
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

describe("flowHaveTasks", () => {
    test("returns true when flow has tasks", () => {
        const yaml = `
        id: test
        tasks:
          - id: task1
          - id: task2
        `;
        expect(YamlUtils.flowHaveTasks(yaml)).toBe(true);
    });

    test("returns false when flow has no tasks", () => {
        const yaml = `
        id: test
        tasks: []
        `;
        expect(YamlUtils.flowHaveTasks(yaml)).toBe(false);
    });
});

describe("flowHaveTasks", () => {
    test("returns true when flow has tasks", () => {
        const yaml = `
        id: test
        tasks:
          - id: task1
          - id: task2
        `;
        expect(YamlUtils.flowHaveTasks(yaml)).toBe(true);
    });

    test("returns false when flow has no tasks", () => {
        const yaml = `
        id: test
        tasks: []
        `;
        expect(YamlUtils.flowHaveTasks(yaml)).toBe(false);
    });
});

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
});

describe("updateMetadata", () => {
    test("updates existing metadata", () => {
        const yaml = `
        id: test
        description: old description
        `;
        const result = YamlUtils.updateMetadata(yaml, {
            description: "new description"
        });
        expect(result).toContain("description: new description");
    });

    test("adds new metadata", () => {
        const yaml = `
        id: test
        `;
        const result = YamlUtils.updateMetadata(yaml, {
            labels: {env: "prod"}
        });
        expect(result).toContain("labels:");
        expect(result).toContain("env: prod");
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
});

describe("deleteMetadata", () => {
    test("removes specified metadata field", () => {
        const yaml = `
        id: test
        description: to be deleted
        tasks:
          - id: task1
        `;
        const result = YamlUtils.deleteMetadata(yaml, "description");
        expect(result).not.toContain("description");
        expect(result).toContain("id: test");
    });

    test("returns unchanged yaml when field doesn't exist", () => {
        const yaml = `
id: test
tasks:
  - id: task1
        `;
        const result = YamlUtils.deleteMetadata(yaml, "nonexistent");
        expect(result).toBe(yaml.trim() + "\n");
    });
});

describe("checkTaskAlreadyExist", () => {
    test("returns task id when task exists", () => {
        const yaml = `
        tasks:
          - id: existing
            type: test
        `;
        const newTask = `
        id: existing
        type: different
        `;
        expect(YamlUtils.checkTaskAlreadyExist(yaml, newTask)).toBe("existing");
    });

    test("returns null when task doesn't exist", () => {
        const yaml = `
        tasks:
          - id: existing
            type: test
        `;
        const newTask = `
        id: new
        type: test
        `;
        expect(YamlUtils.checkTaskAlreadyExist(yaml, newTask)).toBeUndefined();
    });
});

describe("replaceTaskInDocument", () => {
    test("replaces task in yaml document", () => {
        const yaml = `
        tasks:
          - id: task1
            type: test
          - id: task2
            type: test
        `;
        const newTask = `
        id: task1
        type: newType
        `;
        const result = YamlUtils.replaceTaskInDocument(yaml, "task1", newTask);
        expect(result).toContain("type: newType");
    });

    test("replaces task with new Id", () => {
        const yaml = `
        tasks:
          - id: task1
            type: test
          - id: task2
            type: test
        `;
        const newTask = `
        id: task3
        type: newType
        `;
        const result = YamlUtils.replaceTaskInDocument(yaml, "task1", newTask);
        expect(result).toContain("id: task3");
    })

    test("do not throw error when task not found", () => {
        const yaml = `
        tasks:
          - id: task1
            type: test
        `;
        const newTask = `
        id: task2
        type: newType
        `;
        expect(() => YamlUtils.replaceTaskInDocument(yaml, "task2", newTask)).not.toThrow();
    });

    test("do nothing when task is not a task", () => {
        const yaml = `
        triggers:
          - id: trigger1
            type: test
        `;
        const newTask = `
        id: trigger1
        type: newType
        `;
        expect(() => YamlUtils.replaceTaskInDocument(yaml, "trigger1", newTask)).not.toThrow();
    })
})

describe("pairsToMap", () => {
    test("converts pairs to map", () => {
        const pairs = [
            new yaml.Pair("key1", "value1"),
            new yaml.Pair("key2", "value2")
        ];
        const result = YamlUtils.pairsToMap(pairs);
        expect(result).toBeInstanceOf(yaml.YAMLMap);
        expect(result.toJSON()).toEqual({
            key1: "value1",
            key2: "value2"
        });
    });
    test("handles empty pairs array", () => {   
        const result = YamlUtils.pairsToMap([]);
        expect(result.toJSON()).toEqual({});
    })
});

describe("extractTask" , () => {
    test("extracts task from yaml", () => {
        const yaml = `
        tasks:
          - id: task1
            type: test
        `;
        const result = YamlUtils.extractTask(yaml, "task1");
        expect(YamlUtils.parse(result ?? "")).toEqual({
            id: "task1",
            type: "test"
        })
    });

    test("returns undefined if task not found", () => {
        const yaml = `
        tasks:
          - id: task1
            type: test
        `;
        const result = YamlUtils.extractTask(yaml, "task2");
        expect(result).toBeFalsy();
    });
})

export const flat = `
id: flat
namespace: io.kestra.tests

tasks:
  - id: 1-1
    type: io.kestra.plugin.core.log.Log
    # comment to keep
    message: 'echo "1-1"'
  - id: 1-2
    type: io.kestra.plugin.core.log.Log
    message: 'echo "1-2"'
`

export const flowable = `
id: flowable
namespace: io.kestra.tests

tasks:
  - id: nest-1
    type: io.kestra.plugin.core.flow.Parallel
    tasks:
      - id: nest-2
        type: io.kestra.plugin.core.flow.Parallel
        tasks:
        - id: nest-3
          type: io.kestra.plugin.core.flow.Parallel
          tasks:
          - id: nest-4
            type: io.kestra.plugin.core.flow.Parallel
            tasks:
              - id: 1-1
                type: io.kestra.plugin.core.log.Log
                message: 'echo "1-1"'
              - id: 1-2
                type: io.kestra.plugin.core.log.Log
                message: 'echo "1-2"'

  - id: end
    type: io.kestra.plugin.core.log.Log
    commands:
      - 'echo "end"'
`

export const plugins = `
id: flowable
namespace: io.kestra.tests

tasks:
  - id: nest-1
    type: io.kestra.core.tasks.unittest.Example
    task:
      id: 1-1
      type: io.kestra.plugin.core.log.Log
      message: "1-1"
  - id: end
    type: io.kestra.plugin.core.log.Log
    message: "end"
`

const replace = `
id: replaced
type: io.kestra.plugin.core.log.Log
# comment to add
message: "replaced"
`

describe("Yaml Utils", () => {
    test("extractTask from a flat flow", () => {
        const doc = YamlUtils.extractTask(flat, "1-1")!;

        expect(doc).toContain("\"1-1\"");
        expect(doc).toContain("# comment to keep");
    })

    test("extractTask from a flowable flow", () => {
        const doc = YamlUtils.extractTask(flowable, "1-2")!;

        expect(doc).toContain("\"1-2\"");
    })

    test("extractTask from a plugin flow", () => {
        const doc = YamlUtils.extractTask(plugins, "1-1")!;

        expect(doc).toContain("\"1-1\"");
    })

    test("extractTask undefined from a flowable flow", () => {
        const doc = YamlUtils.extractTask(flowable, "X-X")!;

        expect(doc).toBe(undefined);
    })

    test("replace from a flat flow", () => {
        const doc = YamlUtils.replaceTaskInDocument(flat, "1-1", replace)!;

        expect(doc).toContain("\"replaced\"");
        expect(doc).toContain("echo \"1-2\"");
        expect(doc).toContain("# comment to add");
        expect(doc).not.toContain("# comment to keep");
    })

    test("replace from a flowable flow", () => {
        const doc = YamlUtils.replaceTaskInDocument(flowable, "1-2", replace);

        expect(doc).toContain("\"replaced\"");
        expect(doc).toContain("echo \"1-1\"");
        expect(doc).toContain("# comment to add");
    })

    test("replace from a plugin flow", () => {
        const doc = YamlUtils.replaceTaskInDocument(plugins, "1-1", replace);

        expect(doc).toContain("\"replaced\"");
        expect(doc).toContain("unittest.Example");
        expect(doc).toContain("# comment to add");
    })

    test("localize cursor parent", () => {
        const yaml = `a: b
c:
  d: e
  f:`;
        expect(YamlUtils.localizeElementAtIndex(yaml, 14)).toEqual({
            key: "d",
            value: "e",
            parents: [
                {
                    "a": "b",
                    "c": {
                        "d": "e",
                        "f": null,
                    },
                },
                {
                    "d": "e",
                    "f": null,
                },
            ],
            range: [
                12,
                14,
                15,
            ]
        });
    })
})

describe("insertErrorInFlowable", () => {
    test("inserts error task in flowable", () => {
        const yaml = `
        tasks:
          - id: task1
            type: io.kestra.plugin.core.log.Log
          - id: task2
            type: io.kestra.plugin.core.flow.Parallel
        `;
        const errorTask = `
        id: error1
        type: io.kestra.plugin.core.error.Error
        `;
        const result = YamlUtils.insertErrorInFlowable(yaml, errorTask, "task2");
        expect(result).toContain("error1");
        expect(result).toMatchInlineSnapshot(`
          "tasks:
            - id: task1
              type: io.kestra.plugin.core.log.Log
            - id: task2
              type: io.kestra.plugin.core.flow.Parallel
              errors:
                - id: error1
                  type: io.kestra.plugin.core.error.Error
          "
        `)
    });

    test("inserts error task in flowable when errors section already exists", () => {
        const yaml = `
        tasks:
          - id: task1
            type: io.kestra.plugin.core.log.Log
          - id: task2
            type: io.kestra.plugin.core.flow.Parallel
            errors:
              - id: existingError
                type: io.kestra.plugin.core.error.Error
        `;
        const errorTask = `
        id: error2
        type: io.kestra.plugin.core.error.Error
        `;

        const result = YamlUtils.insertErrorInFlowable(yaml, errorTask, "task2");
        expect(result).toContain("error2");
        expect(result).toContain("existingError");
        expect(result).toMatchInlineSnapshot(`
          "tasks:
            - id: task1
              type: io.kestra.plugin.core.log.Log
            - id: task2
              type: io.kestra.plugin.core.flow.Parallel
              errors:
                - id: existingError
                  type: io.kestra.plugin.core.error.Error
                - id: error2
                  type: io.kestra.plugin.core.error.Error
          "
        `)
    })

    test("inserts error in nested flowable", () => {
        const yaml = `
        tasks:
          - id: task1
            type: io.kestra.plugin.core.flow.Parallel
            tasks:
              - id: task2
                type: io.kestra.plugin.core.flow.Parallel
        `;
        const errorTask = `
        id: error1
        type: io.kestra.plugin.core.error.Error
        `;
        const result = YamlUtils.insertErrorInFlowable(yaml, errorTask, "task2");
        expect(result).toContain("error1");
        expect(result).toMatchInlineSnapshot(`
          "tasks:
            - id: task1
              type: io.kestra.plugin.core.flow.Parallel
              tasks:
                - id: task2
                  type: io.kestra.plugin.core.flow.Parallel
                  errors:
                    - id: error1
                      type: io.kestra.plugin.core.error.Error
          "
        `)
    })

    test("not to throw error if flowable not found", () => {
        const yaml = `
        tasks:
          - id: task1
            type: io.kestra.plugin.core.log.Log
        `;
        const errorTask = `
        id: error1
        type: io.kestra.plugin.core.error.Error
        `;
        expect(() => YamlUtils.insertErrorInFlowable(yaml, errorTask, "task2")).not.toThrow();
    });
})

describe("getLastTask", () => {
    test("returns last task in flowable", () => {
        const yaml = `
        tasks:
          - id: task1
            type: io.kestra.plugin.core.log.Log
          - id: task2
            type: io.kestra.plugin.core.flow.Parallel
        `;
        const result = YamlUtils.getLastTask(yaml);
        expect(result).toBe("task2");
    });

    test("returns last subtask in flowable", () => {
        const yaml = `
        id: test
        namespace: test
        tasks:
          - id: task1
            type: io.kestra.plugin.core.log.Log
          - id: task2
            type: io.kestra.plugin.core.flow.Parallel
            tasks:
              - id: task3
                type: foo
              - id: task4
                type: baz
        `;
        const result = YamlUtils.getLastTask(yaml, "task2");
        expect(result).toBe("task4");
    });

    test("returns undefined when no tasks exist", () => {
        const yaml = `
        tasks: []
        `;
        const result = YamlUtils.getLastTask(yaml);
        expect(result).toBeUndefined();
    });
})

describe("getTaskType", () => {
    test("returns task type", () => {
        const yaml = `
        tasks:
          - id: task1
            type: io.kestra.plugin.core.log.Log
        `;
        expect(YamlUtils.getTaskType(yaml, 
            {lineNumber: 2, column: 50}, 
            ["io.kestra.plugin.core.log.Log"])
        ).toEqual("io.kestra.plugin.core.log.Log");
    })
})

describe("extractPluginDefault", () => {
    test("returns plugin default with task type", () => {
        const yaml = `
        pluginDefaults:
          - type: io.kestra.plugin.core.log.Log
            values:
              key1: value1
              key2: value2
        `;
        const result = YamlUtils.extractPluginDefault(yaml, "io.kestra.plugin.core.log.Log") ?? "";
        expect(YamlUtils.parse(result)).toEqual({
            type: "io.kestra.plugin.core.log.Log",
            values: {
                key1: "value1",
                key2: "value2"
            }
        });
    })

    test("returns null if type not found", () => {
        const yaml = `
        pluginDefaults:
          - type: io.kestra.plugin.core.log.Log
            values:
              key1: value1
              key2: value2
        `;
        const result = YamlUtils.extractPluginDefault(yaml, "io.kestra.plugin.core.flow.Parallel");
        expect(result).toBeUndefined();
    })
})

describe("replacePluginDefaultsInDocument", () => {
    test("replaces plugin defaults in yaml document", () => {
        const yaml = `
        pluginDefaults:
          - type: io.kestra.plugin.core.log.Log
            values:
              key1: value1
              key2: value2
        `;
        const newPluginDefault = `
        type: io.kestra.plugin.core.log.Log
        values:
          key1: newValue1
          key2: newValue2
        `;
        const result = YamlUtils.replacePluginDefaultsInDocument(yaml, "io.kestra.plugin.core.log.Log", newPluginDefault);
        expect(result).toMatchInlineSnapshot(`
          "pluginDefaults:
            - type: io.kestra.plugin.core.log.Log
              values:
                key1: newValue1
                key2: newValue2
          "
        `)
        expect(result).toContain("key1: newValue1");
        expect(result).toContain("key2: newValue2");
    });

    test("does not throw error when plugin default not found", () => {
        const yaml = `
        pluginDefaults:
          - type: io.kestra.plugin.core.log.Log
            values:
              key1: value1
              key2: value2
        `;
        const newPluginDefault = `
        type: io.kestra.plugin.core.flow.Parallel
        values:
          key1: newValue1
          key2: newValue2
        `;
        expect(() => YamlUtils.replacePluginDefaultsInDocument(yaml, "io.kestra.plugin.core.flow.Parallel", newPluginDefault)).not.toThrow();
    });
})

describe("deletePluginDefaults", () => {
    test("removes specified plugin default", () => {
        const yaml = `
        pluginDefaults:
          - type: io.kestra.plugin.core.log.Log
            values:
              key1: value1
              key2: value2
        `;
        const result = YamlUtils.deletePluginDefaults(yaml, "io.kestra.plugin.core.log.Log");
        expect(result).not.toContain("io.kestra.plugin.core.log.Log");
    });

    test("returns unchanged yaml when plugin default doesn't exist", () => {
        const yaml = `
pluginDefaults:
  - type: io.kestra.plugin.core.log.Log
    values:
      key1: value1
      key2: value2
        `;
        const result = YamlUtils.deletePluginDefaults(yaml, "io.kestra.plugin.core.flow.Parallel");
        expect(result).toBe(yaml.trim() + "\n");
    });
    test("returns unchanged yaml when no plugin defaults exist", () => {
        const yaml = `
        tasks:
          - id: task1
            type: io.kestra.plugin.core.log.Log
        `;
        const result = YamlUtils.deletePluginDefaults(yaml, "io.kestra.plugin.core.log.Log");
        expect(YamlUtils.parse(result)).toEqual(YamlUtils.parse(yaml));
    })
})

describe("deleteSection", () => {
    test("removes specified section", () => {
        const yaml = `
        finally:
          - id: task1
            type: io.kestra.plugin.core.log.Log
          - id: task2
            type: io.kestra.plugin.core.flow.Parallel
        `;
        const result = YamlUtils.deleteSection(yaml, "finally", "task1");
        expect(result).not.toContain("- id: task1");
    });

    test("returns unchanged yaml when section doesn't exist", () => {
        const yaml = `
tasks:
  - id: task1
    type: io.kestra.plugin.core.log.Log
        `;
        const result = YamlUtils.deleteSection(yaml, "triggers", "task1");
        expect(result).toBe(yaml.trim() + "\n");
    });

    test("removes section where last item was deleted", () => {
        const yaml = `
        tasks:
          - id: task1
            type: io.kestra.plugin.core.log.Log
        finally:
          - id: finally1
            type: io.kestra.plugin.core.log.Log
        `;
        const result = YamlUtils.deleteSection(yaml, "finally", "finally1");
        expect(result).not.toContain("finally");
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
                28,
                160,
                160,
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
                172,
                304,
                304,
              ],
            },
          ]
        `);
    });

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
    })
})