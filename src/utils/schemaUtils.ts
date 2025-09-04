import Utils from "./Utils.ts";

export interface JSONProperty {
    type: string;
    name?: string;
    unit?: string;
    $dynamic?: boolean;
    $ref?: string;
    $required?: boolean;
    $beta?: boolean;
    $deprecated?: boolean;
    $internalStorageURI?: boolean;
    allOf?: JSONProperty[];
    anyOf?: JSONProperty[];
    items?: JSONProperty;
    additionalProperties?: JSONProperty;
    title?: string;
    description?: string;
    default?: string;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    minItems?: number;
    maxItems?: number;
    minimum?: number;
    exclusiveMinimum?: number;
    maximum?: number;
    exclusiveMaximum?: number;
    format?: string;
    enum?: string[];
}

export interface JSONSchema {
    title?: string
    description?: string
    definitions?: Record<string, JSONSchema>
    outputs?: {
        properties: Record<string, JSONProperty>
    }
    properties?: Record<string, JSONProperty> & {
        title?: string
        description?: string
        length?: number
        properties?: Record<string, JSONProperty>
        $beta?: boolean
        $examples?: {
            title?: string
            code: string
            lang?: string
            full?: boolean
        }[]
        $metrics?: JSONProperty[];
    }
}

type ExtractedTypes = { types: string[], subType?: string };

function extractTypesOrRef(propType: JSONProperty): string[] | undefined {
    if (propType.type) {
        return Array.isArray(propType.type) ? propType.type : [propType.type];
    }

    if (propType.$ref) {
        const ref = propType.$ref;
        return ["#" + ref.slice(8)];
    }

    return undefined;
}

// Can take a "#full.class.Name" format
export function className(anchor: string): string {
    const noGenericType = anchor.split("_")[0];
    return noGenericType.substring(noGenericType.lastIndexOf(".") + 1);
}

export function extractEnumValues(property: JSONProperty): string[] | undefined {
    if (property.enum) {
        return property.enum;
    }

    if (property.items?.enum) {
        return property.items.enum;
    }

    if (property.additionalProperties?.enum) {
        return property.additionalProperties.enum;
    }

    return undefined;
}

export function aggregateAllOf(property: JSONProperty): JSONProperty {
    if (property.allOf) {
        property = property.allOf.reduce((acc, curr) => {
            return {
                ...acc,
                ...curr,
            };
        }, {...property});

        delete property.allOf;
    }


    return property;
}

export function extractTypeInfo(property: JSONProperty): ExtractedTypes {
    const result: ExtractedTypes = {} as ExtractedTypes;

    const getTypes = (property: JSONProperty) => {
        const types = extractTypesOrRef(property);
        if (types && types.length > 0) {
            return types;
        }
        if (property.anyOf) {
            return property.anyOf.flatMap(extractTypesOrRef).filter(o => o !== undefined).filter(Utils.distinctFilter);
        }
        return undefined;
    };

    const extractedType = getTypes(property);
    if (extractedType) {
        result.types = extractedType;
    } else {
        result.types = ["object"];
    }

    if (result.types.includes("array") && property.items) {
        const typesToAdd = getTypes(property.items);
        if (typesToAdd && property.items.anyOf) {
            result.types = result.types.filter(type => type !== "array").concat(typesToAdd);
        }
    }

    if (property.additionalProperties) {
        result.subType = extractTypesOrRef(property.additionalProperties)?.[0];
    } else if (property.items) {
        result.subType = extractTypesOrRef(property.items)?.[0];
    }

    return result;
}
