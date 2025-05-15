import yaml, {
    Document,
    YAMLMap,
} from "yaml";
import {SECTIONS} from "./constants";
import {
    checkPluginPropertyAlreadyExists,
    cleanMetadata, deleteMetadata,
    deletePluginDefaults,
    deletePluginProperty,
    extractPluginDefault,
    extractPluginProperty,
    flowHaveTasks, getAllCharts, getChartAtPosition, getLastPluginProperty, getMetadata,
    getTypeAtPosition as getTaskType,
    insertErrorInFlowable,
    insertPluginProperty,
    localizeElementAtIndex,
    pairsToMap, parse,
    replaceIdAndNamespace,
    replacePluginDefaultsInDocument,
    replacePluginPropertyInDocument,
    sort, stringify, updateMetadata
} from "./YamlUtils";

export type YamlElement = {
    key?: string;
    value: Record<string, any>;
    parents: Record<string, any>[];
    range?: [number, number, number];
};

const TOSTRING_OPTIONS = {lineWidth: 0};

export const YamlUtils = {
    stringify,

    parse,

    pairsToMap,

    extractTask(source: string, taskId: string) {
        const blocks = [
            "tasks",
            "triggers",
            "errors",
            "finally",
            "afterExecution",
            "pluginDefaults",
        ]
        for (const block of blocks) {
            const task = extractPluginProperty(source, block, taskId)
            if (task) {
                return task
            }
        }
        return undefined
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

    replaceTaskInDocument(source: string, taskId: string, newContent: string, block: string = "tasks", keyName: string = "id") {
        return replacePluginPropertyInDocument(
            source,
            block,
            keyName,
            taskId,
            newContent
        )
    },

    sort,

    getAllCharts,

    getChartAtPosition,

    localizeElementAtIndex,

    getTaskType,

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
        return insertPluginProperty(source, "tasks", newTask, taskId, insertPosition, parentTaskId);
    },

    insertSection(sectionType: string, source: string, task: string) {
        return insertPluginProperty(source, sectionType, task);
    },

    insertErrorInFlowable,

    /**
     * Delete an item in any section by matching it's id
     * @param source the full yaml source
     * @param section the yaml identifier of the section to delete from
     * @param id the id of the item to delete
     * @returns yaml (source) without the item
     */
    deleteSection(source: string, section: string, id: string) {
        return deletePluginProperty(source, section, id);
    },

    deleteTask(source: string, taskId: string, section: string) {
        const inSection =
            section === SECTIONS.TASKS ? ["tasks", "errors"] : ["triggers"];
        return inSection.reduce((src, sec) => deletePluginProperty(src, sec, taskId), source);
    },

    getLastTask(source: string, parentTaskId?: string): string | undefined {
        return getLastPluginProperty(source, "tasks", parentTaskId);
    },

    checkTaskAlreadyExist(source: string, taskYaml: string) {
        return checkPluginPropertyAlreadyExists(source, "tasks", taskYaml, "id")
    },

    isParentChildrenRelation(source: string, task1: string, task2: string) {
        return (
            this.isChildrenOf(source, task2, task1) ||
            this.isChildrenOf(source, task1, task2)
        );
    },


    /** @private */
    isChildrenOf(source: string, parentTask: string, childTask: string) {
        const yamlDoc = yaml.parseDocument(source)
        const yamlDocParentTask = this._extractTask(yamlDoc, parentTask) as any
        let isChildrenOf = false;
        yaml.visit(yamlDocParentTask, {
            Map(_, map) {
                if (map.get("id") === childTask) {
                    isChildrenOf = true;
                    return yaml.visit.BREAK;
                }
            },
        });
        return isChildrenOf;
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

    replaceIdAndNamespace,

    updateMetadata,

    cleanMetadata,

    getMetadata,

    deleteMetadata,

    flowHaveTasks,

    extractPluginDefault,

    replacePluginDefaultsInDocument,

    deletePluginDefaults,
};
