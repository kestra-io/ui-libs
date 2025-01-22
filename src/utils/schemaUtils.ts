import Utils from "./Utils.ts";

export interface JSONProperty {
    type:string;
    $dynamic?: boolean;
    $ref?:string;
    $required?:boolean;
    $beta?: boolean;
    $deprecated?: boolean;
    oneOf?:JSONProperty[];
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
    return anchor.substring(anchor.lastIndexOf(".") + 1);
}

export function extractTypeInfo(property: JSONProperty): ExtractedTypes {
    const result: ExtractedTypes = {} as ExtractedTypes;

    const extractedType = extractTypeOrRef(property);
    if (extractedType) {
        result.types = [extractedType];
    } else if (property.oneOf) {
        result.types = property.oneOf.map(extractTypeOrRef).filter(o => o !== undefined).filter(Utils.distinctFilter);
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