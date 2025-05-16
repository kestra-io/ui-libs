import yaml, {
    Document,
    YAMLMap,
} from "yaml";
import {SECTIONS} from "./constants";
import {
    checkBlockAlreadyExists,
    cleanMetadata, deleteMetadata,
    deletePluginDefaults,
    deleteBlock,
    extractPluginDefault,
    extractBlock,
    flowHaveTasks, getAllCharts, getChartAtPosition, getLastBlock, getMetadata,
    getTypeAtPosition as getTaskType,
    insertErrorInFlowable,
    insertBlock,
    isParentChildrenRelation,
    localizeElementAtIndex,
    pairsToMap, parse,
    replaceIdAndNamespace,
    replacePluginDefaultsInDocument,
    replaceBlockInDocument,
    sort, stringify, updateMetadata
} from "./YamlUtils";

export type YamlElement = {
    key?: string;
    value: Record<string, any>;
    parents: Record<string, any>[];
    range?: [number, number, number];
};

const TOSTRING_OPTIONS = {lineWidth: 0};

const BLOCKS = [
            "tasks",
            "triggers",
            "errors",
            "finally",
            "afterExecution",
            "pluginDefaults",
        ]

export const YamlUtils = {
    stringify,
    parse,
    pairsToMap,
    extractTask(source: string, taskId: string) {
        
        for (const block of BLOCKS) {
            const task = extractBlock(source, block, taskId)
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
        return replaceBlockInDocument(
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
        return insertBlock(source, "tasks", newTask, taskId, insertPosition, parentTaskId);
    },

    insertSection(sectionType: string, source: string, task: string) {
        return insertBlock(source, sectionType, task);
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
        return deleteBlock(source, section, id);
    },

    deleteTask(source: string, taskId: string, section: string) {
        const inSection =
            section === SECTIONS.TASKS ? ["tasks", "errors"] : ["triggers"];
        return inSection.reduce((src, sec) => deleteBlock(src, sec, taskId), source);
    },

    getLastTask(source: string, parentTaskId?: string): string | undefined {
        return getLastBlock(source, "tasks", parentTaskId);
    },

    checkTaskAlreadyExist(source: string, taskYaml: string) {
        return checkBlockAlreadyExists(source, "tasks", taskYaml, "id")
    },

    isParentChildrenRelation(source: string, task1: string, task2: string) {
        return isParentChildrenRelation(source, BLOCKS, task1, task2);
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
