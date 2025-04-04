import Utils from "./Utils.ts";

export interface JSONProperty {
    type:string;
    $dynamic?: boolean;
    $ref?:string;
    $required?:boolean;
    $beta?: boolean;
    $deprecated?: boolean;
    $internalStorageURI?: boolean;
    allOf?:JSONProperty[];
    anyOf?:JSONProperty[];
    items?: JSONProperty;
    additionalProperties?:JSONProperty;
    title?:string;
    description?:string;
    default?:string;
    pattern?:string;
    minLength?:number;
    maxLength?:number;
    minItems?:number;
    maxItems?:number;
    minimum?:number;
    exclusiveMinimum?:number;
    maximum?:number;
    exclusiveMaximum?:number;
    format?:string;
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
    }
}

type ExtractedTypes = { types: string[], subType?: string };

function extractTypeOrRef(propType: JSONProperty): string | undefined {
    if (propType.type) {
        return propType.type;
    }

    if (propType.$ref) {
        const ref = propType.$ref;
        return "#" + ref.slice(8);
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

    const extractedType = extractTypeOrRef(property);
    if (extractedType) {
        result.types = [extractedType];
    } else if (property.anyOf) {
        result.types = property.anyOf.map(extractTypeOrRef).filter(o => o !== undefined).filter(Utils.distinctFilter);
    } else {
        result.types = ["object"];
    }

    if (property.additionalProperties) {
        result.subType = extractTypeOrRef(property.additionalProperties);
    } else if (property.items) {
        result.subType = extractTypeOrRef(property.items);
    }

    return result;
}
