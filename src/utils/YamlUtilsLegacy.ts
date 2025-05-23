import yaml, {
    Document,
    YAMLMap,
} from "yaml";
import {SECTIONS as BE_SECTIONS} from "./constants";
import {
    checkBlockAlreadyExists,
    cleanMetadata, deleteMetadata,
    deletePluginDefaults,
    deleteBlock,
    extractPluginDefault,
    extractBlock,
    flowHaveTasks, getAllCharts, getChartAtPosition, getLastBlock, getMetadata, getVersionAtPosition,
    getTypeAtPosition as getTaskType,
    insertErrorInFlowable,
    insertBlock,
    isParentChildrenRelation,
    localizeElementAtIndex,
    pairsToMap, parse,
    replaceIdAndNamespace,
    replacePluginDefaultsInDocument,
    replaceBlockInDocument,
    sort, stringify, updateMetadata,
    extractFieldFromMaps
} from "./FlowYamlUtils";

export type YamlElement = {
    key?: string;
    value: Record<string, any>;
    parents: Record<string, any>[];
    range?: [number, number, number];
};

const TOSTRING_OPTIONS = {lineWidth: 0};

const SECTIONS = [
            "tasks",
            "triggers",
            "errors",
            "finally",
            "afterExecution",
            "pluginDefaults",
        ]
/**
 * @deprecated prefer using FlowYamlUtils directly for tree shaking
 */
export const YamlUtils = {
    stringify,
    parse,
    pairsToMap,
    extractTask(source: string, taskId: string) {
        
        for (const section of SECTIONS) {
            const task = extractBlock({source, section, key: taskId})
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
        return replaceBlockInDocument({
            source,
            section: block,
            keyName,
            key: taskId,
            newContent
        })
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
        return insertBlock({
            source, section: "tasks", newBlock: newTask, refKey: taskId, position: insertPosition, parentKey: parentTaskId});
    },

    insertSection(sectionType: string, source: string, task: string) {
        return insertBlock({source, section: sectionType, newBlock: task});
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
        return deleteBlock({source, section, key: id});
    },

    deleteTask(source: string, taskId: string, section: string) {
        const inSection =
            section === BE_SECTIONS.TASKS ? ["tasks", "errors"] : ["triggers"];
        return inSection.reduce((src, sec) => deleteBlock({source:src, section:sec, key:taskId}), source);
    },

    getLastTask(source: string, parentTaskId?: string): string | undefined {
        return getLastBlock({source, section: "tasks", parentKey:parentTaskId});
    },

    checkTaskAlreadyExist(source: string, taskYaml: string) {
        return checkBlockAlreadyExists({
            source, 
            section:"tasks", 
            newContent: taskYaml, 
            keyName: "id"
        })
    },

    isParentChildrenRelation(source: string, task1: string, task2: string) {
        return isParentChildrenRelation({
            source, 
            sections: SECTIONS, 
            key1: task1, 
            key2: task2,
            keyName: "id"
        });
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

    extractFieldFromMaps,

    getVersionAtPosition

};
