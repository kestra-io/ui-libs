import {dump, load} from "js-yaml";
import {
    Scalar,
    YAMLMap,
    YAMLSeq,
    Document,
    Node,
    Pair,
    LineCounter,
    parseDocument,
    isPair,
    isMap,
    isSeq,
    visit,
    Range,
} from "yaml";
import cloneDeep from "lodash/cloneDeep";

export function parse<T = any>(item?: string, throwIfError = true): T | undefined {
    if (item === undefined) return undefined;

    try {
        return load(item) as any;
    } catch (e) {
        if (throwIfError) throw e;
        return undefined;
    }
}

export function stringify(item: any) {
    if (item === undefined) return "";

    const clonedValue = cloneDeep(item);
    delete clonedValue.deleted;

    return dump(transform(clonedValue), {
        lineWidth: -1,
        noCompatMode: true,
        quotingType: "\"",
    });
}

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
    "pluginDefaults"
];

export function sort(value: Record<string, any>) {
    return Object.keys(value)
        .sort((a, b) => {
            const aIndex = SORT_FIELDS.indexOf(a);
            const bIndex = SORT_FIELDS.indexOf(b);
            const aIndexProtected = aIndex >= 0 ? aIndex : Number.MAX_SAFE_INTEGER;
            const bIndexProtected = bIndex >= 0 ? bIndex : Number.MAX_SAFE_INTEGER;

            return aIndexProtected - bIndexProtected;
        });
}

export function pairsToMap(pairs?: any[]) {
    const map = new YAMLMap();
    if (!isPair(pairs?.[0])) {
        return map;
    }

    for (const pair of pairs) {
        map.add(pair);
    };
    return map;
}

function transform(value: any): any {
    if (value instanceof Array) {
        return value.map((r) => {
            return transform(r);
        });
    } else if (typeof value === "string" || value instanceof String) {
        return value;
    } else if (value instanceof Object) {
        return sort(value).reduce((accumulator, r) => {
            if (value[r] !== undefined) {
                accumulator[r] = transform(value[r]);
            }

            return accumulator;
        }, Object.create({}));
    }

    return value;
}

function getSectionNodeAndDocumentFromSource({source, section}: {
    source: string,
    section: string
}) {
    const yamlDoc = parseDocumentTyped(source);
    const sectionNode = getSectionFromDocument({yamlDoc, section});
    return {yamlDoc, sectionNode};
}

function parseDocumentTyped(source: string) {
    return parseDocument(source) as Document<YAMLMap<{ value: string }, Node>>;
}

function getSectionFromDocument({yamlDoc, section}:
    {
        yamlDoc: Document<YAMLMap<{ value: string }, Node>>,
        section: string
    }) {
    const sectionNode = yamlDoc.contents?.items.find(
        (e) => e.key.value === section
    ) as { value: YAMLSeq<YAMLMap<{ value: string }, Node>> } | undefined;
    return sectionNode?.value;
}

export function extractBlock({source, section, key, keyName}: {
    source: string,
    section: string,
    key: string,
    keyName?: string
}) {
    if (!keyName) {
        keyName = "id";
    }
    const {sectionNode} = getSectionNodeAndDocumentFromSource({source, section});
    if (!sectionNode) {
        return undefined;
    }

    const blockNode = extractBlockFromDocument({
        yamlDoc: sectionNode,
        keyName,
        key,
    });

    return blockNode === undefined
        ? undefined
        : new Document(blockNode).toString(TOSTRING_OPTIONS);
}

function extractBlockFromDocument({yamlDoc, keyName, key, callback}: {
    yamlDoc: Node,
    keyName: string,
    key: string,
    /**
     * Callback function to modify the found element
     * @param element The found YAMLMap element
     */
    callback?: (element: YAMLMap<{ value: string }, string | Node>) => any,
}) {
    function find(element?: Node): Node | void {
        if (!element) {
            return;
        }
        if (isMap<{ value: string }, string | Node>(element)) {
            if (element.get("type") !== undefined && key === element.get(keyName)) {
                return callback ? callback(element) : element;
            }
        }
        if (isSeq<{ value: Node }>(element)
            || isMap<{ value: string }, Node>(element)) {
            for (const [key, item] of element.items.entries()) {
                const result = isMap(item)
                    ? find(item)
                    : find(item.value ?? undefined)

                if (result) {
                    if (callback) {
                        if (isMap(element) && isPair<{ value: string }, Node>(item)) {
                            // replace value in the map
                            element.set(item.key, result);
                        } else {
                            element.items[key] = result as any;
                        }
                    } else if (result) {
                        return result;
                    }
                }
            }
        }
    }

    const result = find(yamlDoc);

    if (result === undefined) {
        return undefined;
    }

    if (callback) {
        return new Document(result);
    } else {
        return new Document(result);
    }
}

export function extractBlockWithPath({source, path}: {
    source: string,
    path: string
}) {
    const doc = extractBlockWithPathFromDocument({
        yamlDoc: parseDocumentTyped(source), 
        path
    });
    if (!doc) {
        return undefined;
    }
    return new Document(doc).toString(TOSTRING_OPTIONS);
}

function extractBlockWithPathFromDocument({yamlDoc, path, callback}: {
    yamlDoc: Document<YAMLMap<{ value: string }, Node>>,
    path: string,
    callback?: (element: YAMLMap<{ value: string }, Node>) => any
}) {
    const parsedPath = parsePath(path);
    const element = yamlDoc.getIn(parsedPath) as YAMLMap<{ value: string }, Node>;
    if (element === undefined) {
        return undefined;
    }
    if (callback) {
        const replacedEl = callback(element);
        yamlDoc.setIn(parsedPath, replacedEl);
        return new Document(replacedEl);
    }
    return new Document(element);
}

export function replaceBlockWithPath({source, path, newContent}: {
    source: string,
    path: string,
    newContent: string
}) {
    const yamlDoc = parseDocumentTyped(source);
    const newItem = yamlDoc.createNode(parseDocument(newContent));

    yamlDoc.setIn(parsePath(path), newItem);

    return yamlDoc.toString(TOSTRING_OPTIONS);
}

export function replaceBlockInDocument({source, section, keyName, key, newContent}: {
    source: string,
    section: string,
    keyName: string,
    key: string,
    newContent: string
}) {
    const {yamlDoc, sectionNode} = getSectionNodeAndDocumentFromSource({source, section});
    const newItem = yamlDoc.createNode(parseDocument(newContent));
    if (!sectionNode) {
        return undefined;
    }

    extractBlockFromDocument({
        yamlDoc: sectionNode, keyName, key, callback(oldValue) {
            restoreCommentsInBlock(
                oldValue as YAMLMap<{ value: string }, Node>,
                newItem as YAMLMap<{ value: string }, Node>
            );

            // replace the old value with the new value
            return newItem;
        }
    });

    return yamlDoc.toString(TOSTRING_OPTIONS);
}

/**
 * keep comments from old plugin property in the new
 * @param oldProperty 
 * @param newProperty 
 */
function restoreCommentsInBlock(oldProperty: YAMLMap<{ value: string }, Node>, newProperty: YAMLMap<{ value: string }, Node>) {
    for (const oldProp of oldProperty.items) {
        for (const newProp of newProperty.items) {
            if (
                oldProp.key.value === newProp.key.value &&
                newProp.value &&
                newProp.value.comment === undefined
            ) {
                newProp.value.comment = oldProp.value?.comment;
                break;
            }
        }
    }
}

export function swapBlocks({source, section, key1, key2, keyName}: {
    source: string,
    section: string,
    key1: string,
    key2: string,
    keyName?: string
}) {
    if (!keyName) {
        keyName = "id";
    }
    const {yamlDoc, sectionNode} = getSectionNodeAndDocumentFromSource({source, section});
    if (!sectionNode) {
        return source;
    }
    const task1 = extractBlockFromDocument({yamlDoc: sectionNode, keyName, key: key1});
    const task2 = extractBlockFromDocument({yamlDoc: sectionNode, keyName, key: key2});

    if (!task1 || !task2) {
        return source;
    }

    visit(yamlDoc, {
        Pair(_, pair: any) {
            if (
                pair.key.value === "dependsOn" &&
                pair.value.items.map((e: any) => e.value).includes(key1)
            ) {
                throw {
                    message: "dependency task",
                    messageOptions: {taskId: key2},
                };
            }
        },
    });

    extractBlockFromDocument({yamlDoc: sectionNode, keyName, key: key1, callback: () => task2});
    extractBlockFromDocument({yamlDoc: sectionNode, keyName, key: key2, callback: () => task1});

    return yamlDoc.toString(TOSTRING_OPTIONS);
}

export function insertBlock({source,
    section,
    newBlock,
    refKey,
    position,
    parentKey,
    keyName,
    subBlockName
}: {
    source: string,
    section: string,
    newBlock: string,
    refKey?: string,
    position?: "before" | "after",
    parentKey?: string,
    keyName?: string,
    subBlockName?: string,
}) {
    if (!keyName) {
        keyName = "id";
    }
    if (!subBlockName) {
        subBlockName = section;
    }
    if (!position) {
        position = "after";
    }
    const {yamlDoc, sectionNode} = getSectionNodeAndDocumentFromSource({source, section});
    const newPropNode = yamlDoc.createNode(parseDocument(newBlock));

    const parentNode: any = parentKey && sectionNode
        ? extractBlockFromDocument({yamlDoc: sectionNode, keyName, key: parentKey})?.contents
        : sectionNode;
    if (!parentNode && parentKey) {
        throw new Error(`Parent block with ID ${parentKey} not found in ${section}`);
    }

    // if the container (parentNode) is missing
    //  - an entire section
    //  - a tasks entry in a flowable task
    //  - a condition section in a trigger
    if (!parentNode || (parentKey && !parentNode.get(subBlockName))) {
        const propertyList = new YAMLSeq();
        propertyList.items.push(newPropNode);
        const blocks = new Pair(new Scalar(subBlockName), propertyList);
        if (!parentKey) {
            yamlDoc.contents?.items.push(blocks);
            return yamlDoc.toString(TOSTRING_OPTIONS);
        }

        if (parentNode && !parentNode.get(subBlockName)) {
            parentNode.items.push(blocks);
            return yamlDoc.toString(TOSTRING_OPTIONS);
        }
    }

    const protectedReferenceKey = refKey
        ?? (position === "after"
            ? getLastBlock({source, section, parentKey: parentKey, keyName, subBlockName})
            : parentNode.items?.[0]?.get(keyName));

    let added = false;
    visit(parentNode, {
        Seq(_, seq) {
            for (const map of seq.items) {
                if (isMap(map)) {
                    if (added) {
                        return visit.BREAK;
                    }
                    if (map.get(keyName) === protectedReferenceKey) {
                        const index = seq.items.indexOf(map);
                        if (position === "before") {
                            if (index === 0) {
                                seq.items.unshift(newPropNode);
                            } else {
                                seq.items.splice(index, 0, newPropNode);
                            }
                        } else {
                            if (index === seq.items.length - 1) {
                                seq.items.push(newPropNode);
                            } else {
                                seq.items.splice(index + 1, 0, newPropNode);
                            }
                        }
                        added = true;
                    }
                }
            }
        },
    });
    return cleanMetadataDocument(yamlDoc).toString(TOSTRING_OPTIONS);
}

function getNodeIndexInParent(
    yamlDoc: Document<YAMLMap<{ value: string }, Node>>,
    patentNode: YAMLMap<{ value: string }, Node>, 
    parentPath: (string|number)[],
    refPath?: string | number, 
    position: "before" | "after" = "after"
) {
    if (refPath === undefined) {
        return position === "before" ? 0 : patentNode.items.length - 1;
    }

    const indexNode = yamlDoc.getIn([...parentPath, refPath]) as any;

    return patentNode.items.indexOf(indexNode);
}

export function parsePath(path: string) {
    const pathParts = path.split(".");
    return pathParts.reduce((acc: (string|number)[], part) => {
        // if the path has a number, it will look like this 
        // path[0]

        const numberPath = part.match(/\[(\d+)\]$/)
        if (numberPath?.[0]) {
            acc.push(part.slice(0, numberPath.index));
            acc.push(parseInt(numberPath[1], 10));
        } else {
            acc.push(part);
        }
        return acc;
    }, [])
}

export function insertBlockWithPath({
    source,
    newBlock,
    refPath,
    position,
    parentPath,
}: {
    source: string,
    parentPath: string,
    newBlock: string,
    refPath?: string | number,
    position?: "before" | "after",
}){
    if (!position) {
        position = "after";
    }
    const yamlDoc = parseDocumentTyped(source);
    const newPropNode = yamlDoc.createNode(parseDocument(newBlock)) as any;

    const parsedPath = parsePath(parentPath);

    const parentNode = yamlDoc.getIn(parsedPath) as YAMLMap<{ value: string }, Node>;
    if (!parentNode) {
        const newParentNode = new YAMLSeq();
        newParentNode.add(newPropNode);
        const parentKey = parentPath.split(".").pop() as string;
        const parentKeyNode = new Pair(new Scalar(parentKey), newParentNode);
        if(parentKey.length === parentPath.length){
            yamlDoc.contents?.items.push(parentKeyNode);
            return yamlDoc.toString(TOSTRING_OPTIONS);
        } else {
            const parentPathWithoutKey = parentPath.substring(0, parentPath.length - parentKey.length - 1);
            const parentNode = yamlDoc.getIn(parsePath(parentPathWithoutKey)) as YAMLMap<{ value: string }, Node>;
            if (!parentNode) {
                throw new Error(`Parent block with path ${parentPathWithoutKey} not found`);
            }
            parentNode.items.push(parentKeyNode);
            return yamlDoc.toString(TOSTRING_OPTIONS);
        }
    }
    const index = getNodeIndexInParent(yamlDoc, parentNode, parsedPath, refPath);
    if (position === "before") {
        parentNode.items.splice(index, 0, newPropNode);
    } else {
        parentNode.items.splice(index + 1, 0, newPropNode);
    }

    return yamlDoc.toString(TOSTRING_OPTIONS);
}


export function deleteBlock({source, section, key, keyName}: {
    source: string,
    section: string,
    key: string,
    keyName?: string
}) {
    if (!keyName) {
        keyName = "id";
    }
    const yamlDoc = parseDocumentTyped(source);
    visit(yamlDoc, {
        Pair(_, pair: any) {
            if (pair.key.value === section) {
                visit(pair.value, {
                    Map(_, map) {
                        if (map.get(keyName) === key) {
                            return visit.REMOVE;
                        }
                    },
                });
            }
        },
    });

    // delete empty sections
    visit(yamlDoc, {
        Pair(_, pair) {
            if (isSeq(pair.value) && pair.value.items.length === 0) {
                return visit.REMOVE;
            }
        },
    });
    return yamlDoc.toString(TOSTRING_OPTIONS);
}


export function deleteBlockWithPath({source, path}: {
    source: string,
    path: string,
}) {
    const yamlDoc = parseDocumentTyped(source);
    const parsedPath = parsePath(path)
    const parsedParentPath = parsedPath.slice(0, -1);
    const parentNode = yamlDoc.getIn(parsedParentPath) as YAMLMap<{ value: string }, Node>;
    if (!parentNode) {
        return source;
    }
    const index = getNodeIndexInParent(yamlDoc, parentNode, parsedPath.slice(0, -1), parsedPath[parsedPath.length - 1]);
    if (parentNode.items.length === 1) {
        yamlDoc.deleteIn(parsedParentPath);
    } else {
        parentNode.items.splice(index, 1);
    }
    return yamlDoc.toString(TOSTRING_OPTIONS);
}

function isChildrenOf(source: string, section: string, parentKey: string, childKey: string, keyName: string) {
    const {sectionNode} = getSectionNodeAndDocumentFromSource({source, section});
    if (!sectionNode) {
        return false;
    }

    const parentDoc = extractBlockFromDocument({yamlDoc: sectionNode, keyName, key: parentKey});

    if (!parentDoc) {
        return false;
    }

    let isChildrenOf = false;
    visit(parentDoc, {
        Map(_, map) {
            if (map.get(keyName) === childKey) {
                isChildrenOf = true;
                return visit.BREAK;
            }
        },
    });
    return isChildrenOf;
}

export function isParentChildrenRelation({source, sections, key1, key2, keyName}:
    { source: string, sections: string[], key1: string, key2: string, keyName: string }) {
    if (!keyName) {
        keyName = "id";
    }
    return sections.reduce((acc, section) => (
        acc
        || isChildrenOf(source, section, key2, key1, keyName)
        || isChildrenOf(source, section, key1, key2, keyName)
    ), false);
}

export function replaceIdAndNamespace(source: string, id: string, namespace: string) {
    return source
        .replace(/^(id\s*:\s*(["']?))\S*/m, "$1" + id + "$2")
        .replace(/^(namespace\s*:\s*(["']?))\S*/m, "$1" + namespace + "$2");
}

export function checkBlockAlreadyExists({source, section, newContent, keyName}:
    { source: string, section: string, newContent: string, keyName: string }) {
    const {sectionNode} = getSectionNodeAndDocumentFromSource({source, section});
    const parsedProp = parse(newContent);
    if (!sectionNode) {
        return undefined
    }
    let propExists = false;
    visit(sectionNode, {
        Map(_, map) {
            if (map.get(keyName) === parsedProp[keyName]) {
                propExists = true;
                return visit.BREAK;
            }
        },
    });
    return propExists ? parsedProp[keyName] : undefined
}

export function getLastBlock({source, section, parentKey, keyName, subBlockName}: {
    source: string,
    section: string,
    parentKey?: string,
    keyName?: string,
    subBlockName?: string
}): string | undefined {
    if (!keyName) {
        keyName = "id";
    }
    if (!subBlockName) {
        subBlockName = section;
    }

    if (parentKey) {
        const {sectionNode} = getSectionNodeAndDocumentFromSource({source, section});
        if (!sectionNode) {
            return undefined
        }
        const parentProperty = extractBlockFromDocument({yamlDoc: sectionNode, keyName, key: parentKey}) as Document<YAMLMap<{
            value: string;
        }, YAMLSeq<YAMLMap>>>;

        if (!parentProperty?.contents?.items) {
            throw new Error(`Parent with ID ${parentKey} not found`);
        }

        const subBlocksNode = parentProperty.contents.items.find((pair: any) => pair.key.value === subBlockName);

        if (!subBlocksNode || (subBlocksNode.value && "value" in subBlocksNode.value && subBlocksNode.value.value === null)) {
            return undefined;
        }

        return subBlocksNode.value?.items[subBlocksNode.value.items.length - 1].get(keyName) as string;
    }

    const parsed = parse(source);

    return parsed[section]?.[parsed?.[section]?.length - 1]?.[keyName];
}

export function updateMetadata(source: string, metadata: Record<string, any>) {
    // TODO: check how to keep comments
    const yamlDoc = parseDocument(source) as any;

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
                new Pair(new Scalar(property), metadata[property])
            );
        }
    }
    return cleanMetadataDocument(yamlDoc).toString(TOSTRING_OPTIONS);
}

export const FLOW_SECTION_KEYS = [
    "tasks",
    "triggers",
    "errors",
    "finally",
    "afterExecution",
    "pluginDefaults",
] as const

export type FlowSectionKeys = typeof FLOW_SECTION_KEYS[number];

export const ORDERED_FLOW_ROOT_KEYS = [
    "id",
    "namespace",
    "description",
    "retry",
    "labels",
    "inputs",
    "variables",
    ...FLOW_SECTION_KEYS,
    "taskDefaults",
    "concurrency",
    "outputs",
    "disabled",
] as const

export type FlowRootKeys = typeof ORDERED_FLOW_ROOT_KEYS[number];

function isItemTruthy(item: Node) {
    if (isSeq(item) || isMap(item)) {
        return item.items.length > 0
    } else {
        return true
    }
}

function cleanMetadataDocument(yamlDoc: Document<YAMLMap<{ value: string }, Node | YAMLSeq>>) {
    if (!yamlDoc?.contents?.items) {
        return yamlDoc;
    }
    const updatedItems = [];
    for (const prop of ORDERED_FLOW_ROOT_KEYS) {
        const item = yamlDoc.contents?.items.find(
            (e: any) => e.key.value === prop
        );
        if (item?.value && isItemTruthy(item.value)) {
            updatedItems.push(item);
        }
    }
    yamlDoc.contents.items = updatedItems;
    return yamlDoc;
}

export function cleanMetadata(source: string) {
    const yamlDoc = parseDocumentTyped(source);
    const cleanedYamlDoc = cleanMetadataDocument(yamlDoc);
    return cleanedYamlDoc.toString(TOSTRING_OPTIONS);
}

export function getMetadata(source: string) {
    const yamlDoc = parseDocument(source) as any;
    const metadata: Record<string, any> = {};
    for (const item of yamlDoc.contents.items) {
        if (!FLOW_SECTION_KEYS.includes(item.key.value)) {
            metadata[item.key.value] =
                isMap(item.value) || isSeq(item.value)
                    ? item.value.toJSON()
                    : item.value.value;
        }
    }
    return metadata;
}

export function deleteMetadata(source: any, metadata: any) {
    const yamlDoc = parseDocument(source) as any;

    if (!yamlDoc.contents.items) {
        return source;
    }

    const item = yamlDoc.contents.items.find((e: any) => e.key.value === metadata);
    if (item) {
        yamlDoc.contents.items.splice(yamlDoc.contents.items.indexOf(item), 1);
    }

    return yamlDoc.toString(TOSTRING_OPTIONS);
}

export function flowHaveTasks(source: string) {
    const {sectionNode} = getSectionNodeAndDocumentFromSource({source, section: "tasks"});
    if (!sectionNode) {
        return false;
    }
    return isSeq(sectionNode) && sectionNode.items.length > 0;
}

export function extractPluginDefault(source: string, pluginType: string) {
    return extractBlock({source, section: "pluginDefaults", key: pluginType, keyName: "type"});
}

export function replacePluginDefaultsInDocument(source: string, pluginType: string, newContent: string) {
    return replaceBlockInDocument({source, section: "pluginDefaults", keyName: "type", key: pluginType, newContent});
}

export function deletePluginDefaults(source: string, pluginType: string) {
    return deleteBlock({source, section: "pluginDefaults", key: pluginType, keyName: "type"});
}

export function insertErrorInFlowable(source: string, errorTask: string, flowableTask: string) {
    const yamlDoc = parseDocument(source) as any;
    const newErrorNode = yamlDoc.createNode(parseDocument(errorTask));
    let added = false;
    visit(yamlDoc, {
        Map(_, map) {
            if (added) {
                return visit.BREAK;
            }
            if (map.get("id") === flowableTask) {
                if (map.items.find((item: any) => item.key.value === "errors")) {
                    (
                        map.items?.find((item: any) => item.key.value === "errors")
                            ?.value as any
                    )?.items.push(newErrorNode);
                } else {
                    const errorsSeq = new YAMLSeq();
                    errorsSeq.items.push(newErrorNode);
                    const errors = new Pair(new Scalar("errors"), errorsSeq);
                    map.items.push(errors);
                }
                added = true;
                return map;
            }
        },
    });
    return yamlDoc.toString(TOSTRING_OPTIONS);
}

/**
 * Specify a source yaml doc, the field to extract recursively in every map of the doc and optionally 
 * a predicate to define which paths should be taken into account `parentPathPredicate` 
 * will take a single argument which is the path of each parent property starting from the root doc (joined with ".")
 * "my.parent.task" will mean that the field was retrieved in my -> parent -> task path.
 */
export function extractFieldFromMaps<T extends string>(
    source: string,
    fieldName: T,
    parentPathPredicate = (_: any, __?: any) => true,
    valuePredicate = (_: any) => true
): (Record<T, any> & {range: Range})[] {
    const yamlDoc = parseDocument(source) as any;
    const maps: any[] = [];
    visit(yamlDoc, {
        Map(_, map, parent) {
            if (
                parentPathPredicate(
                    parent
                        .filter((p) => isPair(p))
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
}

function extractAllTypes(source: string, validTypes: string[] = []){
    return extractFieldFromMaps(source, "type", () => true, (value) =>
        validTypes.some((t) => t === value)
    );
}


/**
 * Get task type at cursor position.
 * Useful to display/update the live docs
 */
export function getTypeAtPosition(
    source: string,
    position: { lineNumber: number; column: number },
    validTypes: any
) {
    const types = extractAllTypes(source, validTypes);

    const lineCounter = new LineCounter();
    parseDocument(source, {lineCounter});
    const cursorIndex =
        lineCounter.lineStarts[position.lineNumber - 1] + position.column;

    for (const type of types.reverse()) {
        if (cursorIndex >= type.range[0]) {
            return type.type;
        }
    }
    return null;
}

const TOSTRING_OPTIONS = {lineWidth: 0};

const yamlKeyCapture = "([^:\\n]+): *";
const indentAndYamlKeyCapture = new RegExp(
    `(( *)(?:${yamlKeyCapture})?)[^\\n]*?$`
);

function getParentKeyByChildIndent(
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
}

function extractIndentAndMaybeYamlKey(stringToTest: string): {
    indent: number;
    yamlKey: string | undefined;
    valueStartIndex: number | undefined;
} | undefined {
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
}

export type YamlElement = {
    key?: string;
    value: Record<string, any>;
    parents: Record<string, any>[];
    range?: [number, number, number];
};

export function localizeElementAtIndex(source: string, indexInSource: number): YamlElement {
    const tillCursor = source.substring(0, indexInSource);

    const indentAndYamlKey: any = extractIndentAndMaybeYamlKey(tillCursor);
    let {yamlKey} = indentAndYamlKey;
    const {indent} = indentAndYamlKey;
    // We search in previous keys to find the parent key
    let valueStartIndex;
    if (yamlKey === undefined) {
        const parentKeyExtract = getParentKeyByChildIndent(
            tillCursor,
            indent
        );
        yamlKey = parentKeyExtract?.key;
        valueStartIndex = parentKeyExtract?.valueStartIndex;
    } else {
        valueStartIndex =
            tillCursor.lastIndexOf(yamlKey + ":") + yamlKey.length + 1;
    }

    const yamlDoc = parseDocument(source) as any;
    const elements: any = [];

    visit(yamlDoc, {
        Pair(_: any, pair: any, parents: readonly any[]) {
            if (pair.value?.range !== undefined && pair.key.value === yamlKey) {
                const beforeElement = source.substring(0, pair.value.range[0]);
                elements.push({
                    parents: parents
                        .filter((p) => isMap(p))
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
}

// CHARTS for dashboard

export function getAllCharts(source: string) {
    const yamlDoc = parseDocument(source) as any;
    const charts: string[] = [];

    visit(yamlDoc, {
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
}

export function getChartAtPosition(source: string, position: { lineNumber: number; column: number }) {
    const yamlDoc = parseDocument(source) as any;
    const lineCounter = new LineCounter();
    parseDocument(source, {lineCounter});
    const cursorIndex =
        lineCounter.lineStarts[position.lineNumber - 1] + position.column;

    let chart: any;
    visit(yamlDoc, {
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
                                    return visit.BREAK;
                                }
                            }
                        }
                    }
                }
            }
        },
    });

    return chart ? chart.toJSON() : null;
}
