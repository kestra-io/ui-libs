import Utils from "./Utils.ts";

type PropType = { type?: string, $ref?: string };
interface Property extends PropType {
    oneOf?: [PropType],
    items?: PropType,
    additionalProperties?: PropType
}

type ExtractedTypes = { types: [string], subType?: string };

function extractTypeOrRef(propType: PropType): string {
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

export function extractTypeInfo(property: Property): ExtractedTypes {
    const result: ExtractedTypes = {}

    const extractedType = extractTypeOrRef(property);
    if (extractedType) {
        result.types = [extractedType];
    } else if (property.oneOf) {
        result.types = property.oneOf.map(extractTypeOrRef).filter(Utils.distinctFilter);
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