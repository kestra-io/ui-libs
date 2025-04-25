import {test, expect} from "vitest";
import {YamlUtils} from "./YamlUtils";

test("parse", () => {
    const yamlString = `
    key1: value1
    key2:
      - item1
      - item2
    key3:
      nestedKey1: nestedValue1
      nestedKey2: nestedValue2
    `;
    const parsedYaml = YamlUtils.parse(yamlString);
    expect(parsedYaml).to.deep.equal({
        key1: "value1",
        key2: ["item1", "item2"],
        key3: {
            nestedKey1: "nestedValue1",
            nestedKey2: "nestedValue2",
        },
    });
})

test("insertTask", () => {
    const yamlString = `
    key1: value1
    key2:
      - item1
      - item2
    key3:
      nestedKey1: nestedValue1
      nestedKey2: nestedValue2
    `;
    const newTask = {
        name: "newTask",
        command: "echo hello",
        args: ["arg1", "arg2"],
        env: {ENV_VAR: "value"},
        cwd: "/path/to/dir",
    };
    const updatedYaml = YamlUtils.insertTask(yamlString, "taskTarget", YamlUtils.stringify(newTask), "after");
    expect(updatedYaml).toMatchInlineSnapshot(`
      "key1: value1
      key2:
        - item1
        - item2
      key3:
        nestedKey1: nestedValue1
        nestedKey2: nestedValue2
      tasks:
        - args:
            - arg1
            - arg2
          command: echo hello
          cwd: /path/to/dir
          env:
            ENV_VAR: value
          name: newTask
      "
    `)
})

test("insertSection", () => {
    const yamlString = `
    id: value1
    namespace: default
    inputs:
      - item1
      - item2
    outputs:
      nestedKey1: nestedValue1
      nestedKey2: nestedValue2
    `;
    const newTask = {
        id: "newSection",
        name: "newSection",
        description: "This is a new section",
        tasks: [],
    };
    const updatedYaml = YamlUtils.insertSection("finally", yamlString, YamlUtils.stringify(newTask));
    expect(updatedYaml).toMatchInlineSnapshot(`
      "id: value1
      namespace: default
      inputs:
        - item1
        - item2
      finally:
        - id: newSection
          description: This is a new section
          tasks: []
          name: newSection
      outputs:
        nestedKey1: nestedValue1
        nestedKey2: nestedValue2
      "
    `)
})