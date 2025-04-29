import {test, expect, describe} from "vitest";
import {YamlUtils} from "./YamlUtils";
import yaml, {
    Document,
    isMap,
    YAMLMap,
    isPair,
    isSeq,
    YAMLSeq,
    LineCounter,
    Pair,
    Scalar,
  } from "yaml";

const yamlString = `
    id: full
    namespace: io.kestra.tests
    labels:
        key1: value1
        key2: value2

    triggers:
      - id: schedule1
        type: schedule
        expression: 42 4 1 * *
        backfill:
          start: 2018-01-01
          depend-on-past: false

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
    `;

test("parse", () => {
    const parsedYaml = YamlUtils.parse(yamlString);
    expect(parsedYaml).toMatchInlineSnapshot(`
      {
        "errors": [
          {
            "id": "alert_on_failure",
            "payload": "{
          "channel": "#alerts",
          "text": "Failure alert for flow {{ flow.namespace }}.{{ flow.id }} with ID {{ execution.id }}"
      }
      ",
            "type": "io.kestra.plugin.notifications.slack.SlackIncomingWebhook",
            "url": "secret('SLACK_WEBHOOK')",
          },
        ],
        "id": "full",
        "labels": {
          "key1": "value1",
          "key2": "value2",
        },
        "namespace": "io.kestra.tests",
        "tasks": [
          {
            "id": "t1",
            "message": "{{ task.id }}",
            "type": "io.kestra.plugin.core.log.Log",
          },
          {
            "format": "second {{ labels.key1 }}",
            "id": "t2",
            "type": "io.kestra.plugin.core.debug.Return",
          },
        ],
        "triggers": [
          {
            "backfill": {
              "depend-on-past": false,
              "start": 2018-01-01T00:00:00.000Z,
            },
            "expression": "42 4 1 * *",
            "id": "schedule1",
            "type": "schedule",
          },
        ],
      }
    `)
    expect(parsedYaml).to.deep.equal({
        "id": "full",
        "labels": {
          "key1": "value1",
          "key2": "value2",
        },
        "namespace": "io.kestra.tests",
        "tasks": [
          {
            "id": "t1",
            "message": "{{ task.id }}",
            "type": "io.kestra.plugin.core.log.Log",
          },
          {
            "format": "second {{ labels.key1 }}",
            "id": "t2",
            "type": "io.kestra.plugin.core.debug.Return",
          },
        ],
        "triggers": [
          {
            "backfill": {
              "depend-on-past": false,
              "start": new Date("2018-01-01T00:00:00.000Z"),
            },
            "expression": "42 4 1 * *",
            "id": "schedule1",
            "type": "schedule",
          },
        ],
        "errors": [
          {
            "id": "alert_on_failure",
            "payload": `{
    "channel": "#alerts",
    "text": "Failure alert for flow {{ flow.namespace }}.{{ flow.id }} with ID {{ execution.id }}"
}
`,
            "type": "io.kestra.plugin.notifications.slack.SlackIncomingWebhook",
            "url": "secret('SLACK_WEBHOOK')",
          },
        ],
      });
})

describe("insertTask", () => {
    test("after", () => {
        const newTask = {
            id: "t0",
            name: "newTask",
            command: "echo hello",
            args: ["arg1", "arg2"],
            env: {ENV_VAR: "value"},
            cwd: "/path/to/dir",
        };

        const updatedYaml = YamlUtils.insertTask(yamlString, "t1", YamlUtils.stringify(newTask), "after");
        expect(updatedYaml).toMatchInlineSnapshot(`
          "id: full
          namespace: io.kestra.tests
          labels:
            key1: value1
            key2: value2

          triggers:
            - id: schedule1
              type: schedule
              expression: 42 4 1 * *
              backfill:
                start: 2018-01-01
                depend-on-past: false

          tasks:
            - id: t1
              type: io.kestra.plugin.core.log.Log
              message: "{{ task.id }}"
            - id: t0
              args:
                - arg1
                - arg2
              command: echo hello
              cwd: /path/to/dir
              env:
                ENV_VAR: value
              name: newTask

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
        expect(updatedYaml).toMatchInlineSnapshot(`
          "id: full
          namespace: io.kestra.tests
          labels:
            key1: value1
            key2: value2

          triggers:
            - id: schedule1
              type: schedule
              expression: 42 4 1 * *
              backfill:
                start: 2018-01-01
                depend-on-past: false

          tasks:
            - id: t0
              args:
                - arg1
                - arg2
              command: echo hello
              cwd: /path/to/dir
              env:
                ENV_VAR: value
              name: newTask
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

          triggers:
            - id: schedule1
              type: schedule
              expression: 42 4 1 * *
              backfill:
                start: 2018-01-01
                depend-on-past: false

          tasks:
            
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

          triggers:
            - id: schedule1
              type: schedule
              expression: 42 4 1 * *
              backfill:
                start: 2018-01-01
                depend-on-past: false

          tasks:
            - id: t1
              type: io.kestra.plugin.core.log.Log
              message: "{{ task.id }}"

            - id: t2
              type: io.kestra.plugin.core.debug.Return
              format: second {{ labels.key1 }}
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

          triggers:
            - id: schedule1
              type: schedule
              expression: 42 4 1 * *
              backfill:
                start: 2018-01-01
                depend-on-past: false

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

describe("getParentTask", () => {
    test("returns parent task id", () => {
        const yaml = `
        tasks:
          - id: parent
            type: parallel
            tasks:
              - id: child
                type: test
        `;
        expect(YamlUtils.getParentTask(yaml, "child")).toBe("parent");
    });

    test("returns null when no parent exists", () => {
        const yaml = `
        tasks:
          - id: task1
            type: test
        `;
        expect(YamlUtils.getParentTask(yaml, "task1")).toBeUndefined();
    });
});

describe("isTaskError", () => {
    test("returns true for error task", () => {
        const yaml = `
        tasks:
          - id: task1
            type: test
        errors:
          - id: error1
            type: error
        `;
        expect(YamlUtils.isTaskError(yaml, "error1")).toBe(true);
    });

    test("returns false for regular task", () => {
        const yaml = `
        tasks:
          - id: task1
            type: test
        `;
        expect(YamlUtils.isTaskError(yaml, "task1")).toBe(false);
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
        const lines = result.split("\n").map(l => l.trim()).filter(l => l);
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

// is this function even used
describe.skip("getNextTaskId", () => {
    test("returns next task in flow graph", () => {
        const yaml = `
        tasks:
          - id: task1
          - id: task2
          - id: finalTask
        `;
        const flowGraph = {
            edges: [
                {source: "task1", target: "task2"},
                {source: "task2", target: "finalTask"}
            ]
        };
        expect(YamlUtils.getNextTaskId("task1", yaml, flowGraph)).toBe("task2");
    });

    test("returns null when no next task exists", () => {
        const yaml = `
        tasks:
          - id: task1
        `;
        const flowGraph = {
            edges: []
        };
        expect(YamlUtils.getNextTaskId("task1", yaml, flowGraph)).toBeNull();
    });

    test("skips non-existent intermediate tasks", () => {
        const yaml = `
        tasks:
          - id: task1
          - id: finalTask
        `;
        const flowGraph = {
            edges: [
                {source: "task1", target: "intermediateTask"},
                {source: "intermediateTask", target: "finalTask"}
            ]
        };
        expect(YamlUtils.getNextTaskId("task1", yaml, flowGraph)).toBe("finalTask");
    });

    test("returns next task in flow graph", () => {
        const yaml = `
        tasks:
          - id: task1
          - id: task2
        `.trim();
        const flowGraph = {
            edges: [
                {
                    source: "task1", 
                    target: "task2"
                },
                {
                    source: "task2", 
                    target: "finalTask"
                }
            ]
        };
        expect(YamlUtils.getNextTaskId("task1", yaml, flowGraph)).toBe("task2");
    });

    test("returns null when no next task exists", () => {
        const yaml = `
        tasks:
          - id: task1
        `;
        const flowGraph = {
            edges: []
        };
        expect(YamlUtils.getNextTaskId("task1", yaml, flowGraph)).toBeNull();
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

describe("isTaskParallel", () => {
    test("returns task config when task is EachParallel", () => {
        const yaml = `
        tasks:
          - id: parallel
            type: io.kestra.core.tasks.flows.EachParallel
            value: [1, 2, 3]
            tasks:
              - id: subtask
                type: io.kestra.core.tasks.scripts.Shell
                commands:
                  - echo "{{ value }}"
        `;
        const result = YamlUtils.isTaskParallel("parallel", yaml);
        expect(result).toEqual({
            id: "parallel",
            type: "io.kestra.core.tasks.flows.EachParallel",
            value: [1, 2, 3],
            tasks: [{
                id: "subtask",
                type: "io.kestra.core.tasks.scripts.Shell",
                commands: ["echo \"{{ value }}\""]
            }]
        });
    });

    test("returns task config when task is Parallel", () => {
        const yaml = `
        tasks:
          - id: parallel
            type: io.kestra.core.tasks.flows.Parallel
            tasks:
              - id: subtask1
                type: io.kestra.core.tasks.scripts.Shell
                commands:
                  - echo "1"
        `;
        const result = YamlUtils.isTaskParallel("parallel", yaml);
        expect(result).toEqual({
            id: "parallel",
            type: "io.kestra.core.tasks.flows.Parallel",
            tasks: [{
                id: "subtask1",
                type: "io.kestra.core.tasks.scripts.Shell",
                commands: ["echo \"1\""]
            }]
        });
    });

    test("returns undefined when task is not parallel", () => {
        const yaml = `
        tasks:
          - id: regular
            type: io.kestra.core.tasks.scripts.Shell
            commands:
              - echo "hello"
        `;
        expect(YamlUtils.isTaskParallel("regular", yaml)).toBeUndefined();
    });
});

describe("isTrigger", () => {
    test("returns true for trigger task", () => {
        const yaml = `
        triggers:
          - id: trigger1
            type: schedule
        `;
        expect(YamlUtils.isTrigger(yaml, "trigger1")).toBe(true);
    });

    test("returns false for non-trigger task", () => {
        const yaml = `
        tasks:
          - id: task1
            type: io.kestra.core.tasks.scripts.Shell
        `;
        expect(YamlUtils.isTrigger(yaml, "task1")).toBe(false);
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
        expect(YamlUtils.checkTaskAlreadyExist(yaml, newTask)).toBeNull();
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


describe("nextDelimiterIndex", () => {
    test("returns index of next delimiter", () => {
        const yaml = "io.kestra.core.tasks.scripts.Shell";
        const result = YamlUtils.nextDelimiterIndex(yaml, 0);
        expect(result).toBe(2); 
    });

    test("returns content length - 1 if no delimiter found", () => {
        const yaml = "baboulinet";
        const result = YamlUtils.nextDelimiterIndex(yaml, 100);
        expect(result).toBe(yaml.length - 1);
    });
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
        expect(result).toMatchInlineSnapshot(`
          "id: task1
          type: test
          "
        `)
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

describe("extractFieldFromMaps", () => {
    const yaml = `
        tasks:
          - id: task1
            type: test
            labels:
              key1: value1
              key2: value2
            tasks:
                - id: task1.1
                  type: test
                  labels:
                    key1: value1
                    key2: value2
                - id: task1.2
                  type: test
                  labels:
                    key1: value1
                    key2: value2
          - id: task2
            type: test
        `;

    test("extracts id field from maps", () => {
        const result = YamlUtils.extractFieldFromMaps(yaml, "id");
        expect(result.map((i: any) => i.id)).toEqual([
            "task1",
            "task1.1",
            "task1.2",
            "task2"
        ]);
    })

    test("extracts label field from maps", () => {
        const result = YamlUtils.extractFieldFromMaps(yaml, "labels");
        expect(result.map((i: any) => JSON.stringify(i.labels))).toEqual(
          [
            "[{\"key1\":\"value1\"},{\"key2\":\"value2\"}]",
            "[{\"key1\":\"value1\"},{\"key2\":\"value2\"}]",
            "[{\"key1\":\"value1\"},{\"key2\":\"value2\"}]",
          ]
        )
    })
})

describe("extractMaps", () => {
    test("extracts maps from yaml", () => {
        const yaml = `
        id: testFlow
        tasks:
          - id: task1
            type: test
            labels:
              key1: value1
              key2: value2
            tasks:
              - id: task1.1
                type: test-1.1
              - id: task1.2
                type: test-1.2
                tasks:
                    - id: task1.2.1
                      type: test-1.2.1
                    - id: task1.2.2
                      type: test-1.2.2
          - id: task2
            type: test
        `;
        const result = YamlUtils.extractMaps(yaml, {
            "tasks": {
                present: true,
                populated: true
            }
        });
        expect(result).toMatchInlineSnapshot(`
          [
            {
              "key": undefined,
              "map": {
                "id": "testFlow",
                "tasks": [
                  {
                    "id": "task1",
                    "labels": {
                      "key1": "value1",
                      "key2": "value2",
                    },
                    "tasks": [
                      {
                        "id": "task1.1",
                        "type": "test-1.1",
                      },
                      {
                        "id": "task1.2",
                        "tasks": [
                          {
                            "id": "task1.2.1",
                            "type": "test-1.2.1",
                          },
                          {
                            "id": "task1.2.2",
                            "type": "test-1.2.2",
                          },
                        ],
                        "type": "test-1.2",
                      },
                    ],
                    "type": "test",
                  },
                  {
                    "id": "task2",
                    "type": "test",
                  },
                ],
              },
              "parents": [],
              "range": [
                9,
                511,
                511,
              ],
            },
            {
              "key": undefined,
              "map": {
                "id": "task1",
                "labels": {
                  "key1": "value1",
                  "key2": "value2",
                },
                "tasks": [
                  {
                    "id": "task1.1",
                    "type": "test-1.1",
                  },
                  {
                    "id": "task1.2",
                    "tasks": [
                      {
                        "id": "task1.2.1",
                        "type": "test-1.2.1",
                      },
                      {
                        "id": "task1.2.2",
                        "type": "test-1.2.2",
                      },
                    ],
                    "type": "test-1.2",
                  },
                ],
                "type": "test",
              },
              "parents": [
                {
                  "id": "testFlow",
                  "tasks": [
                    {
                      "id": "task1",
                      "labels": {
                        "key1": "value1",
                        "key2": "value2",
                      },
                      "tasks": [
                        {
                          "id": "task1.1",
                          "type": "test-1.1",
                        },
                        {
                          "id": "task1.2",
                          "tasks": [
                            {
                              "id": "task1.2.1",
                              "type": "test-1.2.1",
                            },
                            {
                              "id": "task1.2.2",
                              "type": "test-1.2.2",
                            },
                          ],
                          "type": "test-1.2",
                        },
                      ],
                      "type": "test",
                    },
                    {
                      "id": "task2",
                      "type": "test",
                    },
                  ],
                },
              ],
              "range": [
                49,
                466,
                466,
              ],
            },
            {
              "key": undefined,
              "map": {
                "id": "task1.2",
                "tasks": [
                  {
                    "id": "task1.2.1",
                    "type": "test-1.2.1",
                  },
                  {
                    "id": "task1.2.2",
                    "type": "test-1.2.2",
                  },
                ],
                "type": "test-1.2",
              },
              "parents": [
                {
                  "id": "testFlow",
                  "tasks": [
                    {
                      "id": "task1",
                      "labels": {
                        "key1": "value1",
                        "key2": "value2",
                      },
                      "tasks": [
                        {
                          "id": "task1.1",
                          "type": "test-1.1",
                        },
                        {
                          "id": "task1.2",
                          "tasks": [
                            {
                              "id": "task1.2.1",
                              "type": "test-1.2.1",
                            },
                            {
                              "id": "task1.2.2",
                              "type": "test-1.2.2",
                            },
                          ],
                          "type": "test-1.2",
                        },
                      ],
                      "type": "test",
                    },
                    {
                      "id": "task2",
                      "type": "test",
                    },
                  ],
                },
                {
                  "id": "task1",
                  "labels": {
                    "key1": "value1",
                    "key2": "value2",
                  },
                  "tasks": [
                    {
                      "id": "task1.1",
                      "type": "test-1.1",
                    },
                    {
                      "id": "task1.2",
                      "tasks": [
                        {
                          "id": "task1.2.1",
                          "type": "test-1.2.1",
                        },
                        {
                          "id": "task1.2.2",
                          "type": "test-1.2.2",
                        },
                      ],
                      "type": "test-1.2",
                    },
                  ],
                  "type": "test",
                },
              ],
              "range": [
                250,
                466,
                466,
              ],
            },
          ]
        `)
        expect(result).toHaveLength(3);
    })
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

const extractMapsSample = `
firstMap:
  populatedField:
  presentField:
  extraField: "firstMap"
secondMap:
  populatedField: "populated"
  presentField:
  extraField: "secondMap"
thirdMap:
  populatedField: "populated"
  extraField: "thirdMap"
`

describe("Yaml Utils", () => {
    test("extractMaps with field conditions", () => {
        const extractMaps = YamlUtils.extractMaps(extractMapsSample, {
            populatedField: {
                populated: true
            },
            presentField: {
                present: true
            }
        });

        expect(extractMaps.length).toBe(1);
        const map = extractMaps[0].map;
        expect(map.populatedField).toBe("populated");
        expect(map.presentField).toBe(undefined);
        expect(map.extraField).toBe("secondMap");
        expect(extractMaps[0].range).toStrictEqual([83, 153, 153]);
    })

    test("extractTask from a flat flow", () => {
        const doc = YamlUtils.extractTask(flat, "1-1")!;

        expect(doc.toString()).toContain("\"1-1\"");
        expect(doc.toString()).toContain("# comment to keep");
    })

    test("extractTask from a flowable flow", () => {
        const doc = YamlUtils.extractTask(flowable, "1-2")!;

        expect(doc.toString()).toContain("\"1-2\"");
    })

    test("extractTask from a plugin flow", () => {
        const doc = YamlUtils.extractTask(plugins, "1-1")!;

        expect(doc.toString()).toContain("\"1-1\"");
    })

    test("extractTask undefined from a flowable flow", () => {
        const doc = YamlUtils.extractTask(flowable, "X-X")!;

        expect(doc).toBe(undefined);
    })

    test("replace from a flat flow", () => {
        const doc = YamlUtils.replaceTaskInDocument(flat, "1-1", replace)!;

        expect(doc.toString()).toContain("\"replaced\"");
        expect(doc.toString()).toContain("echo \"1-2\"");
        expect(doc.toString()).toContain("# comment to add");
        expect(doc.toString()).not.toContain("# comment to keep");
    })

    test("replace from a flowable flow", () => {
        const doc = YamlUtils.replaceTaskInDocument(flowable, "1-2", replace);

        expect(doc.toString()).toContain("\"replaced\"");
        expect(doc.toString()).toContain("echo \"1-1\"");
        expect(doc.toString()).toContain("# comment to add");
    })

    test("replace from a plugin flow", () => {
        const doc = YamlUtils.replaceTaskInDocument(plugins, "1-1", replace);

        expect(doc.toString()).toContain("\"replaced\"");
        expect(doc.toString()).toContain("unittest.Example");
        expect(doc.toString()).toContain("# comment to add");
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

    test("extract indent and yaml key", () => {
        const fourCharsIndent = `a: b
c:
  d: e
  f:
    `;
        expect(YamlUtils.extractIndentAndMaybeYamlKey(fourCharsIndent)).toEqual({
            indent: 4,
            yamlKey: undefined,
            valueStartIndex: undefined
        });
        expect(YamlUtils.extractIndentAndMaybeYamlKey(fourCharsIndent + "g: h")).toEqual({
            indent: 4,
            yamlKey: "g",
            valueStartIndex: 27
        });
        expect(YamlUtils.extractIndentAndMaybeYamlKey(fourCharsIndent + "g:\n      h: i")).toEqual({
            indent: 6,
            yamlKey: "h",
            valueStartIndex: 36
        });
    })

    test("parent key by child indent", () => {
        const yaml = `a: b
c:
  d: e
  f:
    g: h`;
        expect(YamlUtils.getParentKeyByChildIndent(yaml, 4)).toEqual({key: "f", valueStartIndex: 19});
        expect(YamlUtils.getParentKeyByChildIndent(yaml, 2)).toEqual({key: "c", valueStartIndex: 7});
    })
})