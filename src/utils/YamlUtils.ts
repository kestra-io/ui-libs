import JsYaml from "js-yaml";
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
import cloneDeep from "lodash/cloneDeep";
import {SECTIONS} from "./constants";
import _ from "lodash";

export type YamlElement = {
  key?: string;
  value: Record<string, any>;
  parents: Record<string, any>[];
  range?: [number, number, number];
};

const yamlKeyCapture = "([^:\\n]+): *";
const indentAndYamlKeyCapture = new RegExp(
  `(( *)(?:${yamlKeyCapture})?)[^\\n]*?$`
);
const TOSTRING_OPTIONS = {lineWidth: 0};

export const YamlUtils = {
  stringify(value: any) {
    if (value === undefined) return "";

    const clonedValue = cloneDeep(value);
    delete clonedValue.deleted;

    return JsYaml.dump(this._transform(clonedValue), {
      lineWidth: -1,
      noCompatMode: true,
      quotingType: "\"",
    });
  },

  parse<T = any>(item?: string, throwIfError = true): T | undefined {
    if (item === undefined) return undefined;

    try {
      return JsYaml.load(item) as any;
    } catch (e) {
      if (throwIfError) throw e;
      return undefined;
    }
  },

  pairsToMap(pairs: any) {
    const map = new YAMLMap();
    if (!isPair(pairs?.[0])) {
      return map;
    }

    pairs.forEach((pair: any) => {
      map.add(pair);
    });
    return map;
  },

  extractTask(source: string, taskId: string) {
    const yamlDoc = yaml.parseDocument(source);
    const taskNode = this._extractTask(yamlDoc, taskId);
    return taskNode === undefined
      ? undefined
      : new yaml.Document(taskNode).toString(TOSTRING_OPTIONS);
  },

  _extractTask(
    yamlDoc: ReturnType<typeof yaml.parseDocument>,
    taskId: string,
    callback?: (element: yaml.YAMLMap<any, any>) => void
  ) {
    function find(element?: any): any {
      if (!element) {
        return;
      }
      if (element instanceof YAMLMap) {
        if (element.get("type") !== undefined && taskId === element.get("id")) {
          return callback ? callback(element) : element;
        }
      }
      if (element.items) {
        for (const [key, item] of element.items.entries()) {
          let result;

          if (item instanceof YAMLMap) {
            result = find(item);
          } else {
            result = find(item.value);
          }

          if (result) {
            if (callback) {
              if (element instanceof YAMLMap) {
                // replace value in the map
                element.set(item.key.value, result);
              } else {
                element.items[key] = result;
              }
            }

            if (!callback && result) {
              return result;
            }
          }
        }
      }
    }

    const result = find(yamlDoc.contents);

    if (result === undefined) {
      return undefined;
    }

    if (callback) {
      return new Document(result);
    } else {
      return new Document(result);
    }
  },

  replaceTaskInDocument(source: string, taskId: string, newContent: string) {
    const yamlDoc = yaml.parseDocument(source) as any;
    const newItem = yamlDoc.createNode(yaml.parseDocument(newContent));

    this._extractTask(yamlDoc, taskId, (oldValue: any) => {
      this.replaceCommentInTask(oldValue, newItem);

      return newItem;
    });

    return yamlDoc.toString(TOSTRING_OPTIONS);
  },

  /**
   * keep comments from oldTask in the newTask
   * @param oldTask 
   * @param newTask 
   */
  replaceCommentInTask(oldTask: any, newTask: any) {
    for (const oldProp of oldTask.items) {
      for (const newProp of newTask.items) {
        if (
          oldProp.key.value === newProp.key.value &&
          newProp.value.comment === undefined
        ) {
          newProp.value.comment = oldProp.value.comment;
          break;
        }
      }
    }
  },

  _transform(value: any): any {
    if (value instanceof Array) {
      return value.map((r) => {
        return this._transform(r);
      });
    } else if (typeof value === "string" || value instanceof String) {
      // value = value
      //     .replaceAll(/\u00A0/g, " ");
      //
      // if (value.indexOf("\\n") >= 0) {
      //     return value.replaceAll("\\n", "\n") + "\n";
      // }

      return value;
    } else if (value instanceof Object) {
      return this.sort(value).reduce((accumulator, r) => {
        if (value[r] !== undefined) {
          accumulator[r] = this._transform(value[r]);
        }

        return accumulator;
      }, Object.create({}));
    }

    return value;
  },

  sort(value: Record<string, any>) {
    const SORT_FIELDS = [
      "id",
      "type",
      "namespace",
      "description",
      "revision",
      "inputs",
      "variables",
      "tasks",
      "errors",
      "triggers",
      "listeners",
    ];

    return Object.keys(value)
      .sort()
      .sort((a, b) => {
        return this.index(SORT_FIELDS, a) - this.index(SORT_FIELDS, b);
      });
  },

  index(based: string[], value: string) {
    const index = based.indexOf(value);

    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  },

  nextDelimiterIndex(content: any, currentIndex: any) {
    const RE = /[ .}]/g

    RE.lastIndex = currentIndex + 1;

    const nextDelimiterMatcher = RE.exec(content);
   
    return nextDelimiterMatcher?.index ?? content.length - 1;
  },

  /**
   * Specify a source yaml doc, the field to extract recursively in every map of the doc and optionally 
   * a predicate to define which paths should be taken into account `parentPathPredicate` 
   * will take a single argument which is the path of each parent property starting from the root doc (joined with ".")
   * "my.parent.task" will mean that the field was retrieved in my -> parent -> task path.
   */
  extractFieldFromMaps<T extends string>(
    source: string,
    fieldName:  T,
    parentPathPredicate = (_: any, __?: any) => true,
    valuePredicate = (_: any) => true
  ): any[] {
    const yamlDoc = yaml.parseDocument(source) as any;
    const maps: any[] = [];
    yaml.visit(yamlDoc, {
      Map(_, map, parent) {
        if (
          parentPathPredicate(
            parent
              .filter((p) => yaml.isPair(p))
              .map((p: any) => p?.key?.value)
              .join(".")
          ) &&
          map.items
        ) {
            for (const item of map.items as any[]) {
                if (item?.key?.value === fieldName) {

              const fieldValue = item?.value?.value ?? item.value?.items;
              if (valuePredicate(fieldValue)) {
                maps.push({
                  [fieldName]: fieldValue,
                  range: map.range,
                });
              }
            }
          }
        }
      },
    });
    return maps;
  },

  /**
   * Make a flat array of all elements in the yaml doc that are maps
   * NOTE: in each item, there seems to be a key property.
   * It's empty form what I see.
   */
  extractMaps(
    source: string,
    fieldConditions?: {
        [field: string]: {
            present?: boolean,
            populated?: boolean
        }
    }
  ): {
    parents: Record<string, any>[];
    key: string;
    map: Record<string, any>;
    range: [number, number, number];
  }[] {
    if (source.match(/^\s*{{/)) {
      return [];
    }

    const yamlDoc = yaml.parseDocument(source) as any;
    const maps: any = [];
    yaml.visit(yamlDoc, {
      Map(_, yamlMap, parents: readonly any[]) {
        if (yamlMap.items) {
          const map = yamlMap.toJS(yamlDoc);
          for (const [fieldName, condition] of Object.entries(
            fieldConditions ?? {}
          ) as [any, any][]) {
            if (condition?.present) {
              if (map[fieldName] === undefined) {
                return;
              }

              if (map[fieldName] === null) {
                map[fieldName] = undefined;
              }
            }
            if (condition?.populated) {
              if (
                map[fieldName] === undefined ||
                map[fieldName] === null ||
                map[fieldName] === ""
              ) {
                return;
              }
            }
          }

          const parentKey = parents[parents.length - 1]?.key?.value;
          const mapParents =
            parents.length > 1
              ? parents
                  .slice(0, parents.length - 1)
                  .filter((p) => yaml.isMap(p))
                  .map((p) => p.toJS(yamlDoc))
              : [];
          maps.push({
            parents: mapParents,
            key: parentKey,
            map,
            range: yamlMap.range,
          });
        }
      },
    });

    return maps;
  },

  getParentKeyByChildIndent(
    stringToSearch: string,
    indent: number
  ): { key: string; valueStartIndex: number } | undefined {
    if (indent < 2) {
      return undefined;
    }

    const matches = stringToSearch.matchAll(
      new RegExp(`(?<! ) {${indent - 2}}(?! )${yamlKeyCapture}`, "g")
    );
    const lastMatch = [...matches].pop();
    if (lastMatch === undefined) {
      return undefined;
    }
    return {
      key: lastMatch[1],
      valueStartIndex: lastMatch.index + lastMatch[0].length,
    };
  },

  getAllCharts(source: any) {
    const yamlDoc = yaml.parseDocument(source) as any;
    const charts: any = [];

    yaml.visit(yamlDoc, {
      Map(_, map) {
        if (map.items) {
          for (const item of map.items as any[]) {
            if (item?.key?.value === "charts" && item?.value?.items) {
              for (const chartItem of item.value.items) {
                charts.push(chartItem.toJSON());
              }
            }
          }
        }
      },
    });

    return charts;
  },

  getChartAtPosition(source: any, position: any) {
    const yamlDoc = yaml.parseDocument(source) as any;
    const lineCounter = new LineCounter();
    yaml.parseDocument(source, {lineCounter});
    const cursorIndex =
      lineCounter.lineStarts[position.lineNumber - 1] + position.column;

    let chart: any = null;
    yaml.visit(yamlDoc, {
      Map(_, map) {
        if (map.items) {
          for (const item of map.items as any[]) {
            if (item?.key?.value === "charts") {
              if (item?.value?.items) {
                for (const chartItem of item.value.items) {
                  if (
                    chartItem.range[0] <= cursorIndex &&
                    chartItem.range[1] >= cursorIndex
                  ) {
                    chart = chartItem;
                    return yaml.visit.BREAK;
                  }
                }
              }
            }
          }
        }
      },
    });

    return chart ? chart.toJSON() : null;
  },

  extractIndentAndMaybeYamlKey(stringToTest: string):
    | {
        indent: number;
        yamlKey: string | undefined;
        valueStartIndex: number | undefined;
      }
    | undefined {
    const exec = indentAndYamlKeyCapture.exec(stringToTest);
    if (exec === null) {
      return undefined;
    }

    const [stringBeforeValue, indent, yamlKey]: [
      string,
      string,
      string | undefined
    ] = [exec[1], exec[2], exec[3]];
    return {
      indent: indent.length,
      yamlKey,
      valueStartIndex:
        yamlKey === undefined
          ? undefined
          : exec.index + stringBeforeValue.length,
    };
  },

  localizeElementAtIndex(source: string, indexInSource: number): YamlElement {
    const tillCursor = source.substring(0, indexInSource);

    const indentAndYamlKey: any = this.extractIndentAndMaybeYamlKey(tillCursor);
    let {yamlKey} = indentAndYamlKey;
    const {indent} = indentAndYamlKey;
    // We search in previous keys to find the parent key
    let valueStartIndex;
    if (yamlKey === undefined) {
      const parentKeyExtract = this.getParentKeyByChildIndent(
        tillCursor,
        indent
      );
      yamlKey = parentKeyExtract?.key;
      valueStartIndex = parentKeyExtract?.valueStartIndex;
    } else {
      valueStartIndex =
        tillCursor.lastIndexOf(yamlKey + ":") + yamlKey.length + 1;
    }

    const yamlDoc = yaml.parseDocument(source) as any;
    const elements: any = [];

    yaml.visit(yamlDoc, {
      Pair(_: any, pair: any, parents: readonly any[]) {
        if (pair.value?.range !== undefined && pair.key.value === yamlKey) {
          const beforeElement = source.substring(0, pair.value.range[0]);
          elements.push({
            parents: parents
              .filter((p) => yaml.isMap(p))
              .map((p) => p.toJS(yamlDoc)),
            key: pair.key.value,
            value: pair.value.toJS(yamlDoc),
            range: [
              pair.value.range[0] -
                (beforeElement.length -
                  beforeElement.replaceAll(/\s*$/g, "").length),
              ...pair.value.range.slice(1),
            ],
          });
        }
      },
    });

    const filter = elements.filter(
      (map: any) =>
        map.range[0] <= valueStartIndex && valueStartIndex <= map.range[2]
    );
    return filter.sort((a: any, b: any) => b.range[0] - a.range[0])?.[0];
  },

  // Find map a cursor position, optionally filtering by a property name that the map must contain
  getMapAtPosition(source: any, position: any, fieldName: string | null = null) {
    const yamlDoc = yaml.parseDocument(source) as any;
    const lineCounter = new yaml.LineCounter();
    yaml.parseDocument(source, {lineCounter});
    const cursorIndex =
      lineCounter.lineStarts[position.lineNumber - 1] + position.column - 1;
    let targetMap: any = null;
    yaml.visit(yamlDoc, {
      Map(_, map: any) {
        if (map.range[0] <= cursorIndex && map.range[1] >= cursorIndex) {
          for (const item of map.items) {
            if (fieldName === null || item.key.value === fieldName) {
              targetMap = map;
            }
          }
        }
      },
    });

    return targetMap ? targetMap.toJSON() : null;
  },

  extractAllTypes(source: string, validTypes:string[] = []): {
    type: string; 
    range: [number, number, number]
  }[] {
    return this.extractFieldFromMaps(source, "type", () => true, (value) =>
      validTypes.some((t) => t === value)
    );
  },

  /**
   * Get task type at cursor position.
   * Useful to display/update the live docs
   */
  getTaskType(
    source: string,
    position: { lineNumber: number; column: number },
    validTypes: any
  ) {
    const types = this.extractAllTypes(source, validTypes);

    const lineCounter = new LineCounter();
    yaml.parseDocument(source, {lineCounter});
    const cursorIndex =
      lineCounter.lineStarts[position.lineNumber - 1] + position.column;

    for (const type of types.reverse()) {
      if (cursorIndex >= type.range[0]) {
        return type.type;
      }
    }
    return null;
  },

  swapTasks(source: string, taskId1: string, taskId2: string) {
    const yamlDoc = yaml.parseDocument(source) as any;

    const task1 = this._extractTask(yamlDoc, taskId1);
    const task2 = this._extractTask(yamlDoc, taskId2);

    yaml.visit(yamlDoc, {
      Pair(_, pair: any) {
        if (
          pair.key.value === "dependsOn" &&
          pair.value.items.map((e: any) => e.value).includes(taskId2)
        ) {
          throw {
            message: "dependency task",
            messageOptions: {taskId: taskId2},
          };
        }
      },
    });

    this._extractTask(yamlDoc, taskId1, () => task2);
    this._extractTask(yamlDoc, taskId2, () => task1);

    return yamlDoc.toString(TOSTRING_OPTIONS);
  },

  insertTask(
    source: string,
    taskId: string,
    newTask: string,
    insertPosition: "before" | "after",
    parentTaskId?: string
  ) {
    const yamlDoc = yaml.parseDocument(source) as any;
    const newTaskNode = yamlDoc.createNode(yaml.parseDocument(newTask));

    const parentTask = parentTaskId ? this._extractTask(
      yamlDoc,
      parentTaskId,
    ) : yamlDoc;
    if(!parentTask && parentTaskId) {
        throw new Error(`Parent task with ID ${parentTaskId} not found`);
    }

    const tasksNode = parentTask.contents.items.find(
      (e: any) => e.key.value === "tasks"
    );

    if (!tasksNode || tasksNode?.value.value === null) {
      if (tasksNode) {
        parentTask.contents.items.splice(
            parentTask.contents.items.indexOf(tasksNode),
          1
        );
      }
      const taskList = new YAMLSeq();
      taskList.items.push(newTaskNode);
      const tasks = new Pair(new Scalar("tasks"), taskList);
      parentTask.contents.items.push(tasks);
      return yamlDoc.toString(TOSTRING_OPTIONS);
    }
    let added = false;
    yaml.visit(parentTask, {
      Seq(_, seq) {
        for (const map of seq.items) {
          if (isMap(map)) {
            if (added) {
              return yaml.visit.BREAK;
            }
            if (map.get("id") === taskId) {
              const index = seq.items.indexOf(map);
              if (insertPosition === "before") {
                if (index === 0) {
                  seq.items.unshift(newTaskNode);
                } else {
                  seq.items.splice(index, 0, newTaskNode);
                }
              } else {
                if (index === seq.items.length - 1) {
                  seq.items.push(newTaskNode);
                } else {
                  seq.items.splice(index + 1, 0, newTaskNode);
                }
              }
              added = true;
              return seq;
            }
          }
        }
      },
    });
    return yamlDoc.toString(TOSTRING_OPTIONS);
  },

  insertSection(sectionType: string, source: any, task: any) {
    const yamlDoc = yaml.parseDocument(source) as any;
    const newNode = yamlDoc.createNode(yaml.parseDocument(task));

    // Find the section in the YAML document
    const section = yamlDoc.contents.items.find(
      (item: any) => item.key.value === sectionType
    );

    if (section) {
      // If the section exists, append the new node
      section.value.items.push(newNode);
    } else {
      // If the section does not exist, create a new one
      const sectionSeq = new yaml.YAMLSeq();
      sectionSeq.items.push(newNode);
      const newSection = new yaml.Pair(
        new yaml.Scalar(sectionType),
        sectionSeq
      );
      yamlDoc?.contents?.items?.push(newSection);
    }

    return this.cleanMetadata(yamlDoc.toString(TOSTRING_OPTIONS));
  },

  // FIXME: flowableTask could have a better type
  insertErrorInFlowable(source: string, errorTask: string, flowableTask: string) {
    const yamlDoc = yaml.parseDocument(source) as any;
    const newErrorNode = yamlDoc.createNode(yaml.parseDocument(errorTask));
    let added = false;
    yaml.visit(yamlDoc, {
      Map(_, map) {
        if (added) {
          return yaml.visit.BREAK;
        }
        if (map.get("id") === flowableTask) {
          if (map.items.find((item: any) => item.key.value === "errors")) {
            (
              map.items?.find((item: any) => item.key.value === "errors")
                ?.value as any
            )?.items.push(newErrorNode);
          } else {
            const errorsSeq = new yaml.YAMLSeq();
            errorsSeq.items.push(newErrorNode);
            const errors = new yaml.Pair(new yaml.Scalar("errors"), errorsSeq);
            map.items.push(errors);
          }
          added = true;
          return map;
        }
      },
    });
    return yamlDoc.toString(TOSTRING_OPTIONS);
  },

  deleteTask(source: string, taskId: string, section: string) {
    const inSection =
      section === SECTIONS.TASKS ? ["tasks", "errors"] : ["triggers"];
    const yamlDoc = yaml.parseDocument(source) as any;
    yaml.visit(yamlDoc, {
      Pair(_, pair: any) {
        if (inSection.includes(pair.key.value)) {
          yaml.visit(pair.value, {
            Map(_, map) {
              if (map.get("id") === taskId) {
                return yaml.visit.REMOVE;
              }
            },
          });
        }
      },
    });
    // delete empty sections
    yaml.visit(yamlDoc, {
      Pair(_, pair) {
        if (isSeq(pair.value) && pair.value.items.length === 0) {
          return yaml.visit.REMOVE;
        }
      },
    });
    return yamlDoc.toString(TOSTRING_OPTIONS);
  },

  getFirstTask(source: string): string | undefined {
    const parse = this.parse(source) as any;

    return parse?.tasks?.[0]?.id;
  },

  getLastTask(source: string, parentTaskId?: string): string | undefined {
    if (parentTaskId) {
      const parsed = yaml.parseDocument(source);
      const parentTask = this._extractTask(parsed, parentTaskId) as any;
    
      if(!parentTask?.contents?.items) {
        throw new Error(`Parent task with ID ${parentTaskId} not found`);
      }

      const tasksNode = parentTask.contents.items.find((pair:any) => pair.key.value === "tasks");

      if(!tasksNode || tasksNode?.value.value === null) {
        return undefined;
      }
    
      return tasksNode.value.items[tasksNode.value.items.length - 1].get("id");
    }

    const parsed = yaml.parse(source);

    return parsed?.tasks && parsed.tasks?.[parsed?.tasks?.length - 1]?.id;
  },

  checkTaskAlreadyExist(source: string, taskYaml: string) {
    const yamlDoc = yaml.parseDocument(source) as any;
    const parsedTask = this.parse(taskYaml) as any;
    let taskExist = false;
    yaml.visit(yamlDoc, {
      Pair(_, pair: any) {
        if (pair.key.value === "tasks") {
          yaml.visit(pair, {
            Map(_, map) {
              if (map.get("id") === parsedTask.id) {
                taskExist = true;
                return yaml.visit.BREAK;
              }
            },
          });
        }
      },
    });
    return taskExist ? parsedTask.id : null;
  },

  isParentChildrenRelation(source: string, task1: string, task2: string) {
    return (
      this.isChildrenOf(source, task2, task1) ||
      this.isChildrenOf(source, task1, task2)
    );
  },

  isChildrenOf(source: string, parentTask: string, childTask: string) {
    const yamlDoc = yaml.parseDocument(
      this.extractTask(source, parentTask) ?? ""
    );
    let isChildrenOf = false;
    yaml.visit(yamlDoc, {
      Map(_, map) {
        if (map.get("id") === childTask) {
          isChildrenOf = true;
          return yaml.visit.BREAK;
        }
      },
    });
    return isChildrenOf;
  },

  getChildrenTasks(source: string, taskId: string) {
    const yamlDoc = yaml.parseDocument(this.extractTask(source, taskId) ?? "");
    const children: string[] = [];
    yaml.visit(yamlDoc, {
      Map(_, map) {
        if (map.get("id") !== taskId) {
          children.push(map.get("id") as any);
        }
      },
    });
    return children;
  },

  getParentTask(source: string, taskId: string) {
    const yamlDoc = yaml.parseDocument(source) as any;
    let parentTask = null;
    yaml.visit(yamlDoc, {
      Map(_, map) {
        if (map.get("id") !== taskId) {
          yaml.visit(map, {
            Map(_, childMap) {
              if (childMap.get("id") === taskId) {
                parentTask = map.get("id");
                return yaml.visit.BREAK;
              }
            },
          });
        }
      },
    });
    return parentTask;
  },

  isTaskError(source: string, taskId: string) {
    const yamlDoc = yaml.parseDocument(source) as any;
    let isTaskError = false;
    yaml.visit(yamlDoc, {
      Pair(_, pair: any) {
        if (pair.key.value === "errors") {
          yaml.visit(pair, {
            Map(_, map) {
              if (map.get("id") === taskId) {
                isTaskError = true;
                return yaml.visit.BREAK;
              }
            },
          });
        }
      },
    });
    return isTaskError;
  },

  isTrigger(source: string, taskId: string) {
    const yamlDoc = yaml.parseDocument(source) as any;
    let isTrigger = false;
    yaml.visit(yamlDoc, {
      Pair(_, pair: any) {
        if (pair.key.value === "triggers") {
          yaml.visit(pair, {
            Map(_, map) {
              if (map.get("id") === taskId) {
                isTrigger = true;
                return yaml.visit.BREAK;
              }
            },
          });
        }
      },
    });
    return isTrigger;
  },

  replaceIdAndNamespace(source: string, id: string, namespace: string) {
    return source
      .replace(/^(id\s*:\s*(["']?))\S*/m, "$1" + id + "$2")
      .replace(/^(namespace\s*:\s*(["']?))\S*/m, "$1" + namespace + "$2");
  },

  updateMetadata(source: string, metadata: Record<string, any>) {
    // TODO: check how to keep comments
    const yamlDoc = yaml.parseDocument(source) as any;

    if (!yamlDoc?.contents?.items) {
      return source;
    }

    for (const property in metadata) {
      if (
        yamlDoc.contents.items.find((item: any) => item.key.value === property)
      ) {
        yamlDoc.contents.items.find(
          (item: any) => item.key.value === property
        ).value = metadata[property];
      } else {
        yamlDoc.contents.items.push(
          new yaml.Pair(new yaml.Scalar(property), metadata[property])
        );
      }
    }
    return this.cleanMetadata(yamlDoc.toString(TOSTRING_OPTIONS));
  },

  cleanMetadata(source: string) {
    // Reorder and remove empty metadata
    const yamlDoc = yaml.parseDocument(source) as any;

    if (!yamlDoc.contents.items) {
      return source;
    }

    const order = [
      "id",
      "namespace",
      "description",
      "retry",
      "labels",
      "inputs",
      "variables",
      "tasks",
      "triggers",
      "errors",
      "finally",
      "afterExecution",
      "taskDefaults",
      "concurrency",
      "outputs",
      "disabled",
    ];
    const updatedItems = [];
    for (const prop of order) {
      const item = yamlDoc.contents.items.find(
        (e: any) => e.key.value === prop
      );
      if (
        item &&
        (((isSeq(item.value) || isMap(item.value)) &&
          item.value.items.length > 0) ||
          item.value.value)
      ) {
        updatedItems.push(item);
      }
    }
    yamlDoc.contents.items = updatedItems;
    return yamlDoc.toString(TOSTRING_OPTIONS);
  },

  getMetadata(source: string) {
    const yamlDoc = yaml.parseDocument(source) as any;
    const metadata: Record<string, any> = {};
    for (const item of yamlDoc.contents.items) {
      if (
        item.key.value !== "tasks" &&
        item.key.value !== "triggers" &&
        item.key.value !== "errors"
      ) {
        metadata[item.key.value] =
          isMap(item.value) || isSeq(item.value)
            ? item.value.toJSON()
            : item.value.value;
      }
    }
    return metadata;
  },

  deleteMetadata(source: any, metadata: any) {
    const yamlDoc = yaml.parseDocument(source) as any;

    if (!yamlDoc.contents.items) {
      return source;
    }

    const item = yamlDoc.contents.items.find((e: any) => e.key.value === metadata);
    if (item) {
      yamlDoc.contents.items.splice(yamlDoc.contents.items.indexOf(item), 1);
    }

    return yamlDoc.toString(TOSTRING_OPTIONS);
  },

  flowHaveTasks(source: string) {
    const tasks = (yaml.parseDocument(source) as any).contents?.items?.find(
      (item: any) => item.key.value === "tasks"
    );
    return tasks && tasks.value.items && tasks.value.items.length >= 1;
  },

  /**
   * Gets aliased task id from the flow graph
   * @param target the task whose id we want to get 
   * @param flowSource the source of the flow
   * @param flowGraph the flow graph to follow to the source
   * @returns the targetId if the task is found, then, following 
   * the graph, the first taskId who can be extracted (that has a type)
  */
  getNextTaskId(target: string, flowSource: string, flowGraph: { 
        edges: {
            source: string, 
            target: string 
        }[] }) {
    while (this.extractTask(flowSource, target) === undefined) {
      const edge = flowGraph.edges.find((e) => e.source === target);
      if (!edge) {
        return null;
      }
      target = edge.target;
    }
    return target;
  },

  isTaskParallel(taskId: string, flowSource: string) {
    const clusterTask = this.parse(
      this.extractTask(flowSource, taskId) ?? ""
    ) as any;
    return clusterTask?.type === "io.kestra.core.tasks.flows.EachParallel" ||
      clusterTask?.type === "io.kestra.core.tasks.flows.Parallel"
      ? clusterTask
      : undefined;
  },

  _extractPluginDefaults(
    yamlDoc: ReturnType<typeof yaml.parseDocument>,
  ) {
    return (yamlDoc.contents as yaml.YAMLMap<{value: string}, unknown>)?.items.find(
        (item) => item.key.value === "pluginDefaults"
    );
  },

  _extractPluginDefault(
    yamlDoc: ReturnType<typeof yaml.parseDocument>,
    taskType: string,
) {
    // first, find the pluginDefaults section
    const pluginDefaults: any = this._extractPluginDefaults(yamlDoc);
    if (!pluginDefaults) {
        return undefined;
    }
    let pluginDefault: any;
    yaml.visit(pluginDefaults, {
      Map(_, map) {
        if (map.get("type") === taskType) {
          pluginDefault = map;
          return yaml.visit.BREAK;
        }
      },
    });
    return pluginDefault;
  },

  extractPluginDefault(source: string, taskType: string){
    const yamlDoc = yaml.parseDocument(source) as any;
    const pluginDefault = this._extractPluginDefault(yamlDoc, taskType);
    if (!pluginDefault) {
      return undefined;
    }
    return new yaml.Document(pluginDefault).toString(TOSTRING_OPTIONS);
  },

  replacePluginDefaultsInDocument(source: string, taskType: string, newContent: string) {
    const yamlDoc = yaml.parseDocument(source) as any;
    const newItem = yamlDoc.createNode(yaml.parseDocument(newContent));

    const oldValue = this._extractPluginDefault(yamlDoc, taskType);
    if (!oldValue) {
      return source;
    }
    const pluginDefaults: any = this._extractPluginDefaults(yamlDoc);
    if (!pluginDefaults) {
      return source;
    }
    const indexOfOldValue = pluginDefaults.value.items.indexOf(oldValue);
    this.replaceCommentInTask(oldValue, newItem);
    if (indexOfOldValue < 0) {
        return source;
    }

    pluginDefaults.value.items.splice(indexOfOldValue, 1, newItem);
    return yamlDoc.toString(TOSTRING_OPTIONS);
  }
};
