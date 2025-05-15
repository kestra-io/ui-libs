import JsYaml from "js-yaml";
import {
  YAMLMap,
  isPair,
  parseDocument,
  Document,
  Node,
  isMap,
  visit,
  Scalar,
  Pair,
  isSeq
} from "yaml";

export function parse<T = any>(item?: string, throwIfError = true): T | undefined {
    if (item === undefined) return undefined;

    try {
        return JsYaml.load(item) as any;
    } catch (e) {
        if (throwIfError) throw e;
        return undefined;
    }
}

export function stringify(item: any) {
    
    if (item === undefined) return "";

    const clonedValue = structuredClone(item);
    delete clonedValue.deleted;

    return JsYaml.dump(transform(clonedValue), {
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

export function pairsToMap(pairs: any) {
    const map = new YAMLMap();
    if (!isPair(pairs?.[0])) {
      return map;
    }

    pairs.forEach((pair: any) => {
      map.add(pair);
    });
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

function getBlockNodeAndDocumentFromSource(source: string, block: string) {
    const yamlDoc = parseDocument(source) as Document<YAMLMap<{value:string}, Node>>;
    const blockNode = getBlockFromDocument(yamlDoc, block);
    return {yamlDoc, blockNode};
}

function getBlockFromDocument(yamlDoc: Document<YAMLMap<{value:string}, Node>>, block: string) {
    const blockNode = yamlDoc.contents?.items.find(
      (e) => e.key.value === block
    );
    return blockNode?.value;
}

export function extractPluginProperty(source: string, block: string, key: string, keyName: string = "id") {
   const {blockNode} = getBlockNodeAndDocumentFromSource(source, block);
    if (!blockNode) {
      return undefined;
    }

    const pluginPropertyNode = extractPluginPropertyFromDocument(
      blockNode,
      keyName,
      key,
    );

    return pluginPropertyNode === undefined
      ? undefined
      : new Document(pluginPropertyNode).toString(TOSTRING_OPTIONS);
}

function extractPluginPropertyFromDocument(
    yamlDoc: Node,
    keyName: string,
    key: string,
    /**
     * Callback function to modify the found element
     * @param element The found YAMLMap element
    */
   callback?: (element: YAMLMap<{value:string}, string | Node>) => void,
) {
    function find(element?: Node): Node | void {
      if (!element) {
        return;
      }
      if (isMap<{value:string}, string | Node>(element)) {
        if (key === element.get(keyName)) {
          return callback ? callback(element) : element;
        }
      }
      if (isMap(element) && element.items) {
        for (const [key, item] of element.items.entries()) {
          let result: Node | void;

          if (isMap(item)) {
            result = find(item);
          } else {
            result = find(item.value as Node);
          }

          if (result) {
            if (callback) {
              if (isMap(element) && isPair<{value:string}, Node>(item)) {
                // replace value in the map
                element.set(item.key.value, result);
              } else if(isPair(result)){
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

export function replacePluginPropertyInDocument(source: string, block: string, keyName: string, key: string, newContent: string) {
    const {yamlDoc, blockNode} = getBlockNodeAndDocumentFromSource(source, block);
    const newItem = yamlDoc.createNode(parseDocument(newContent));
    if (!blockNode) {
      return undefined;
    }

    if(!yamlDoc.contents) {
      return source;
    }

    extractPluginPropertyFromDocument(yamlDoc.contents, keyName, key, (oldValue) => {
      restoreCommentsInPluginProperty(
        oldValue as YAMLMap<{value:string}, Node>, 
        newItem as YAMLMap<{value:string}, Node>
    );

      // replace the old value with the new value
      return newItem;
    });

    return yamlDoc.toString(TOSTRING_OPTIONS);
}

/**
 * keep comments from old plugin property in the new
 * @param oldProperty 
 * @param newProperty 
 */
function restoreCommentsInPluginProperty(oldProperty: YAMLMap<{value:string}, Node>, newProperty: YAMLMap<{value:string}, Node>) {
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

export function swapPluginPropertyInDocument(source: string, block: string, key1: string, key2: string, keyName: string = "id") {
    const {yamlDoc, blockNode} = getBlockNodeAndDocumentFromSource(source, block);
    if(!blockNode) {
        return source;
    }
    const task1 = extractPluginPropertyFromDocument(blockNode, keyName, key1);
    const task2 = extractPluginPropertyFromDocument(blockNode, keyName, key2);

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
    
    extractPluginPropertyFromDocument(blockNode, keyName, key1, () => task2);
    extractPluginPropertyFromDocument(blockNode, keyName, key2, () => task1);

    return yamlDoc.toString(TOSTRING_OPTIONS);
}

function isChildrenOf(source: string, block: string, parent: string, child: string, keyName: string) {
    const {blockNode} = getBlockNodeAndDocumentFromSource(source, block);
    if (!blockNode) {
      return false;
    }

    const parentDoc = extractPluginPropertyFromDocument(blockNode, keyName, parent);

    if (!parentDoc) {
      return false;
    }

    let isChildrenOf = false;
    visit(parentDoc, {
      Map(_, map) {
        if (map.get(keyName) === child) {
          isChildrenOf = true;
          return visit.BREAK;
        }
      },
    });
    return isChildrenOf;
}

export function isParentChildrenRelation(source: string, block: string, prop1: string, prop2: string, keyName: string = "id") {
    return (
      isChildrenOf(source, block, prop2, prop1, keyName) ||
      isChildrenOf(source, block, prop1, prop2, keyName)
    );
}

export function replaceIdAndNamespace(source: string, id: string, namespace: string) {
    return source
        .replace(/^(id\s*:\s*(["']?))\S*/m, "$1" + id + "$2")
        .replace(/^(namespace\s*:\s*(["']?))\S*/m, "$1" + namespace + "$2");
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

const ORDERED_FLOW_ROOT_KEYS = [
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
    "pluginDefaults",
    "taskDefaults",
    "concurrency",
    "outputs",
    "disabled",
] as const

function cleanMetadataDocument(yamlDoc: Document<YAMLMap<{value:string}, Node>>) {
    if (!yamlDoc?.contents?.items) {
        return yamlDoc;
    }
    const updatedItems = [];
        for (const prop of ORDERED_FLOW_ROOT_KEYS) {
          const item = yamlDoc.contents?.items.find(
            (e: any) => e.key.value === prop
          );
          if (
            item &&
            (((isSeq(item.value) || isMap(item.value)) && 
              item.value.items.length > 0) ||
              item.value && "value" in item.value && item.value.value)
          ) {
            updatedItems.push(item);
          }
        }
        yamlDoc.contents.items = updatedItems;
        return yamlDoc;
}

export function cleanMetadata(source: string) {
    const yamlDoc = parseDocument(source) as Document<YAMLMap<{value:string}, Node>>;
    const cleanedYamlDoc = cleanMetadataDocument(yamlDoc);
    return cleanedYamlDoc.toString(TOSTRING_OPTIONS);
}

const FLOW_BLOCK_KEYS = [
    "tasks",
    "triggers",
    "errors",
    "finally",
    "afterExecution",
    "pluginDefaults",
] as const;

export function getMetadata(source: string) {
    const yamlDoc = parseDocument(source) as any;
    const metadata: Record<string, any> = {};
    for (const item of yamlDoc.contents.items) {
        if (!FLOW_BLOCK_KEYS.includes(item.key.value)) {
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

const TOSTRING_OPTIONS = {lineWidth: 0};