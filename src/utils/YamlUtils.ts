import JsYaml from "js-yaml";
import yaml, {
  Document,
  YAMLMap,
  isSeq,
  isMap,
  Pair,
  Scalar,
  YAMLSeq,
  LineCounter,
} from "yaml";
import cloneDeep from "lodash/cloneDeep";
import {SECTIONS} from "./constants";


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

  parse(item: string, throwIfError = true) {
    if (item === undefined) return undefined;

    try {
      return JsYaml.load(item);
    } catch (e) {
      if (throwIfError) throw e;
      return undefined;
    }
  },

  extractTask(source:string, taskId:string) {
    const yamlDoc = yaml.parseDocument(source);
    const taskNode = this._extractTask(yamlDoc, taskId);
    return taskNode === undefined
      ? undefined
      : new yaml.Document(taskNode).toString(TOSTRING_OPTIONS);
  },

  _extractTask(yamlDoc:ReturnType<typeof yaml.parseDocument>, taskId:string, callback?:(element: yaml.YAMLMap<any, any>) => void) {
    function find(element?: any):any {
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
    };

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

  replaceTaskInDocument(source:string, taskId:string, newContent:string) {
    const yamlDoc = yaml.parseDocument(source);
    const newItem = yamlDoc.createNode(yaml.parseDocument(newContent));

    this._extractTask(yamlDoc, taskId, (oldValue: any) => {
        this.replaceCommentInTask(oldValue, newItem);

      return newItem;
    });

    return yamlDoc.toString(TOSTRING_OPTIONS);
  },

  replaceCommentInTask(oldTask:any, newTask:any) {
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

  _transform(value:any):any {
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

  sort(value:Record<string, any>) {
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
        return (
          this.index(SORT_FIELDS, a) - this.index(SORT_FIELDS, b)
        );
      });
  },

  index(based:string[], value:string) {
    const index = based.indexOf(value);

    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  },

  extractAllTypes(source:string) {
    const yamlDoc = yaml.parseDocument(source);
    const types:{type:string, range: any}[] = [];
    if (
      yamlDoc.contents &&
      "items" in yamlDoc.contents &&
      yamlDoc.contents.items.find((e) =>
        "key" in e && "value" in e.key && ["tasks", "triggers", "errors", "layout"].includes(e.key.value as string)
      )
    ) {
      yaml.visit(yamlDoc, {
        Map(_, map) {
          if (map.items) {
            for (const item of map.items as any[]) {
              if (item.key.value === "type") {
                const type = item.value?.value;
                types.push({type, range: map.range});
              }
            }
          }
        },
      });
    }
    return types;
  },

  getTaskType(source:string, position:{lineNumber:number, column:number}) {
    const types = this.extractAllTypes(source);
    const lineCounter = new LineCounter();
    yaml.parseDocument(source, {lineCounter});
    const cursorIndex =
      lineCounter.lineStarts[position.lineNumber - 1] + position.column;

    for (const type of types.reverse()) {
      if (cursorIndex > type.range[1]) {
        return type.type;
      }
      if (cursorIndex >= type.range[0] && cursorIndex <= type.range[1]) {
        return type.type;
      }
    }
    return null;
  },

  swapTasks(source:string, taskId1:string, taskId2:string) {
    const yamlDoc = yaml.parseDocument(source);

    const task1 = this._extractTask(yamlDoc, taskId1);
    const task2 = this._extractTask(yamlDoc, taskId2);

    yaml.visit(yamlDoc, {
      Pair(_, pair:any) {
        if (
          pair.key.value === "dependsOn" &&
          pair.value.items.map((e:any) => e.value).includes(taskId2)
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

  insertTask(source:string, taskId:string, newTask:string, insertPosition:"before" | "after") {
    const yamlDoc = yaml.parseDocument(source) as any;
    const newTaskNode = yamlDoc.createNode(yaml.parseDocument(newTask));
    const tasksNode = yamlDoc.contents.items.find(
      (e:any) => e.key.value === "tasks"
    );
    if (!tasksNode || tasksNode?.value.value !== null) {
      if (tasksNode) {
        yamlDoc.contents.items.splice(
          yamlDoc.contents.items.indexOf(tasksNode),
          1
        );
      }
      const taskList = new YAMLSeq();
      taskList.items.push(newTaskNode);
      const tasks = new Pair(new Scalar("tasks"), taskList);
      yamlDoc.contents.items.push(tasks);
      return yamlDoc.toString(TOSTRING_OPTIONS);
    }
    let added = false;
    yaml.visit(yamlDoc, {
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

  insertTrigger(source:string, triggerTask:string) {
    const yamlDoc = yaml.parseDocument(source) as any;
    const newTriggerNode = yamlDoc.createNode(yaml.parseDocument(triggerTask));
    let added = false;
    const triggers = yamlDoc.contents.items.find(
      (item:any) => item.key.value === "triggers"
    );
    if (triggers && triggers.value.items) {
      yaml.visit(yamlDoc, {
        Pair(_, pair:any) {
          if (added) {
            return yaml.visit.BREAK;
          }
          if (pair.key.value === "triggers") {
            pair.value.items.push(newTriggerNode);
            added = true;
            return pair;
          }
        },
      });
    } else {
      if (triggers) {
        yamlDoc.contents.items.splice(
          yamlDoc.contents.items.indexOf(triggers),
          1
        );
      }
      const triggersSeq = new yaml.YAMLSeq();
      triggersSeq.items.push(newTriggerNode);
      const newTriggers = new yaml.Pair(
        new yaml.Scalar("triggers"),
        triggersSeq
      );
      yamlDoc.contents.items.push(newTriggers);
    }
    return this.cleanMetadata(yamlDoc.toString(TOSTRING_OPTIONS));
  },

  insertError(source:string, errorTask:string) {
    const yamlDoc = yaml.parseDocument(source) as any;
    const newErrorNode = yamlDoc.createNode(yaml.parseDocument(errorTask));
    const errors = yamlDoc.contents.items.find(
      (item:any) => item.key.value === "errors"
    );
    if (errors && errors.value.items) {
      yamlDoc.contents.items[
        yamlDoc.contents.items.indexOf(errors)
      ].value.items.push(newErrorNode);
    } else {
      if (errors) {
        yamlDoc.contents.items.splice(
          yamlDoc.contents.items.indexOf(errors),
          1
        );
      }
      const errorsSeq = new yaml.YAMLSeq();
      errorsSeq.items.push(newErrorNode);
      const newErrors = new yaml.Pair(new yaml.Scalar("errors"), errorsSeq);
      yamlDoc.contents.items.push(newErrors);
    }
    return this.cleanMetadata(yamlDoc.toString(TOSTRING_OPTIONS));
  },

  // FIXME: flowableTask could have a better type
  insertErrorInFlowable(source:string, errorTask:string, flowableTask:any) {
    const yamlDoc = yaml.parseDocument(source);
    const newErrorNode = yamlDoc.createNode(yaml.parseDocument(errorTask));
    let added = false;
    yaml.visit(yamlDoc, {
      Map(_, map) {
        if (added) {
          return yaml.visit.BREAK;
        }
        if (map.get("id") === flowableTask) {
          if (map.items.find((item:any) => item.key.value === "errors")) {
            (map.items?.find((item:any) => item.key.value === "errors")?.value as any)?.items.push(newErrorNode);
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

  deleteTask(source:string, taskId:string, section: string) {
    const inSection =
      section === SECTIONS.TASKS ? ["tasks", "errors"] : ["triggers"];
    const yamlDoc = yaml.parseDocument(source);
    yaml.visit(yamlDoc, {
      Pair(_, pair:any) {
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

  getFirstTask(source:string):string | undefined {
    const parse = this.parse(source) as any;

    return parse?.tasks?.[0]?.id;
  },

  checkTaskAlreadyExist(source:string, taskYaml:string) {
    const yamlDoc = yaml.parseDocument(source);
    const parsedTask = this.parse(taskYaml) as any;
    let taskExist = false;
    yaml.visit(yamlDoc, {
      Pair(_, pair:any) {
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

  isParentChildrenRelation(source:string, task1:string, task2:string) {
    return (
      this.isChildrenOf(source, task2, task1) ||
      this.isChildrenOf(source, task1, task2)
    );
  },

  isChildrenOf(source: string, parentTask:string, childTask:string) {
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

  getChildrenTasks(source:string, taskId:string) {
    const yamlDoc = yaml.parseDocument(this.extractTask(source, taskId) ?? "");
    const children:any[] = [];
    yaml.visit(yamlDoc, {
      Map(_, map) {
        if (map.get("id") !== taskId) {
          children.push(map.get("id"));
        }
      },
    });
    return children;
  },

  getParentTask(source:string, taskId:string) {
    const yamlDoc = yaml.parseDocument(source);
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

  isTaskError(source:string, taskId:string) {
    const yamlDoc = yaml.parseDocument(source);
    let isTaskError = false;
    yaml.visit(yamlDoc, {
      Pair(_, pair:any) {
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

  isTrigger(source:string, taskId:string) {
    const yamlDoc = yaml.parseDocument(source);
    let isTrigger = false;
    yaml.visit(yamlDoc, {
      Pair(_, pair:any) {
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

  replaceIdAndNamespace(source:string, id:string, namespace:string) {
    return source
      .replace(/^(id\s*:\s*(["']?))\S*/m, "$1" + id + "$2")
      .replace(/^(namespace\s*:\s*(["']?))\S*/m, "$1" + namespace + "$2");
  },

  updateMetadata(source:string, metadata:Record<string, any>) {
    // TODO: check how to keep comments
    const yamlDoc = yaml.parseDocument(source) as any;

    if (!yamlDoc?.contents?.items) {
      return source;
  }

    for (const property in metadata) {
      if (yamlDoc.contents.items.find((item:any) => item.key.value === property)) {
        yamlDoc.contents.items.find(
          (item:any) => item.key.value === property
        ).value = metadata[property];
      } else {
        yamlDoc.contents.items.push(
          new yaml.Pair(new yaml.Scalar(property), metadata[property])
        );
      }
    }
    return this.cleanMetadata(yamlDoc.toString(TOSTRING_OPTIONS));
  },

  cleanMetadata(source:string) {
    // Reorder and remove empty metadata
    const yamlDoc = yaml.parseDocument(source) as any;
    const order = [
      "id",
      "namespace",
      "description",
      "labels",
      "inputs",
      "variables",
      "tasks",
      "triggers",
      "errors",
      "taskDefaults",
    ];
    const updatedItems = [];
    for (const prop of order) {
      const item = yamlDoc.contents.items.find((e:any) => e.key.value === prop);
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

  getMetadata(source:string) {
    const yamlDoc = yaml.parseDocument(source) as any;
    const metadata: Record<string,any> = {};
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

    const item = yamlDoc.contents.items.find(e => e.key.value === metadata);
    if (item) {
        yamlDoc.contents.items.splice(yamlDoc.contents.items.indexOf(item), 1);
    }

    return yamlDoc.toString(TOSTRING_OPTIONS);
  },

  flowHaveTasks(source:string) {
    const tasks = (yaml
      .parseDocument(source) as any)
      .contents?.items?.find((item:any) => item.key.value === "tasks");
    return tasks && tasks.value.items && tasks.value.items.length >= 1;
  },

  getNextTaskId(target:string, flowSource:string, flowGraph:any) {
    while (this.extractTask(flowSource, target) === undefined) {
      const edge = flowGraph.edges.find((e:any) => e.source === target);
      if (!edge) {
        return null;
      }
      target = edge.target;
    }
    return target;
  },

  isTaskParallel(taskId:string, flowSource:string) {
    const clusterTask = this.parse(
      this.extractTask(flowSource, taskId) ?? ""
    ) as any;
    return clusterTask?.type === "io.kestra.core.tasks.flows.EachParallel" ||
      clusterTask?.type === "io.kestra.core.tasks.flows.Parallel"
      ? clusterTask
      : undefined;
  },
};
