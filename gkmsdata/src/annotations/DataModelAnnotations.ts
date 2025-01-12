import "reflect-metadata";
import type { $Undefinable } from "../TypeHelpers";
import MetadataKeys from "./MetadataKeys";
import type DataModelObject from "../model/DataModelObject";
import BuiltInObjectTags from "../model/BuiltInObjectTags";

type BasicClassConstructor = new (...params: unknown[]) => object;

export const enum BuiltInObjectType {
    unset,
    string,
    float,
    integer,
    boolean,
    empty,
    MAX = empty,
}

export const enum ObjectType {
    plain = BuiltInObjectType.MAX + 1,
    nested,
}

export type DataClassType = ObjectType | BuiltInObjectType;

export const enum FieldType {
    unknown,
    string,
    float,
    integer,
    enum = integer,
    boolean,
    empty,
    array,
    plainObject,
    nestedObject,
}

export class ObjectTypeHelper {
    static fieldTypeToObjectType(fieldType: FieldType): DataClassType {
        switch (fieldType) {
            case FieldType.unknown:
                return BuiltInObjectType.unset;
            case FieldType.string:
                return BuiltInObjectType.string;
            case FieldType.float:
                return BuiltInObjectType.float;
            case FieldType.integer:
                return BuiltInObjectType.integer;
            case FieldType.boolean:
                return BuiltInObjectType.boolean;
            case FieldType.empty:
                return BuiltInObjectType.empty;
            case FieldType.plainObject:
                return ObjectType.plain;
            case FieldType.nestedObject:
                return ObjectType.nested;
            case FieldType.array:
                break;
            default:
                break;
        }

        throw new TypeError(`cannot map field type ${fieldType} to appropriate object type`);
    }
}

type PartiallyRequired<T, Keys extends keyof T> = Omit<T, Keys> & Required<Pick<T, Keys>>;

interface DataClassProps {
    name?: string;
    objectType?: DataClassType;
}

interface UserInputDataClassProps extends DataClassProps {
    objectType?: ObjectType;
}

export interface RuntimeDataClassProps extends Required<DataClassProps> {
    // No extra fields
}

export interface DataFieldReadOptions {
    // Nothing for now
}

export interface DataFieldWriteOptions {
    /**
     * Used with float fields only. If `true`, trim numbers that are potentially integers to their integer from, e.g.
     * 234.0 -> "234". If `false`, always preserve the decimal point, e.g. 234.0 -> "234.0".
     */
    trimFloatNumbers?: boolean;
}

interface DataFieldProps {
    /**
     * The field name in serialized object.
     */
    name?: string;
    type?: FieldType;
    /**
     * Data class type reference for this field, or items if this field is an array.
     * Can be set to a {@link DataModelObject} if that data class's `@dataClass` does not explicitly specify a different type name that the class' actual name.
     * @remark Use special name "string", "integer", "float", "boolean", "empty" for corresponding built-in types.
     */
    typeRef?: string | BuiltInObjectTags | DataModelObject;
    /**
     * Used on array fields. It hints the serializer whether each array item should be serialized as plain object,
     * or nested object.
     */
    itemsObjectTypeHint?: ObjectType;
    optional?: boolean;
    missingValue?: unknown;
    /**
     * Optional options for deserialization.
     */
    readOptions?: DataFieldReadOptions;
    /**
     * Optional options for serialization.
     */
    writeOptions?: DataFieldWriteOptions;
}

interface UserInputDataFieldProps extends DataFieldProps {
    // No extra fields
}

interface DataFieldProps2 extends UserInputDataFieldProps {
    /**
     * Original field/property name of the entity object. Use this name to access the target object's properties.
     */
    originalName: string;
}

export interface RuntimeDataFieldProps extends PartiallyRequired<DataFieldProps2, "name" | "type" | "optional"> {
    typeRef?: string;
}

export const $gAllDataModels = new Map<string, DataModelObject>();

export function dataClass(props?: UserInputDataClassProps) {
    return function <T extends BasicClassConstructor>(constructor: T): T {
        const p: RuntimeDataClassProps = Object.create(null);

        if (props) {
            Object.assign(p, props);
        }

        p.name = p.name || constructor.name;
        p.objectType = typeof p.objectType === "undefined" ? BuiltInObjectType.unset : p.objectType;

        Reflect.defineMetadata(MetadataKeys.DataClass, p, constructor);
        $gAllDataModels.set(p.name, constructor);

        return constructor;
    };
}

function processFieldOrProperty(props: $Undefinable<DataFieldProps2>, propertyKey: string): RuntimeDataFieldProps {
    const p: RuntimeDataFieldProps = Object.create(null);

    if (props) {
        Object.assign(p, props);
    }

    p.originalName = propertyKey;
    p.name = p.name || propertyKey;
    p.type = typeof p.type === "undefined" ? FieldType.unknown : p.type;
    p.optional = typeof p.optional === "undefined" ? false : p.optional;

    if (props && props.typeRef) {
        if (typeof props.typeRef === "string") {
            // preserve
        } else if (typeof props.typeRef.name === "string") {
            p.typeRef = props.typeRef.name;
        } else {
            p.typeRef = undefined;
        }
    } else {
        p.typeRef = undefined;
    }

    return p;
}

export function dataField(props?: DataFieldProps) {
    return function (target: object, propertyKey: string): void {
        const p = processFieldOrProperty(props as DataFieldProps2, propertyKey);

        Reflect.defineMetadata(MetadataKeys.DataField, p, target, propertyKey);
        Reflect.defineMetadata(MetadataKeys.OriginalMemberName, propertyKey, target, propertyKey);
    };
}

export function dataProperty(props?: DataFieldProps) {
    return function (
        target: object,
        propertyKey: string,
        descriptor: PropertyDescriptor | undefined
    ): PropertyDescriptor | void {
        const p = processFieldOrProperty(props as DataFieldProps2, propertyKey);

        Reflect.defineMetadata(MetadataKeys.DataProperty, p, target, propertyKey);
        Reflect.defineMetadata(MetadataKeys.OriginalMemberName, propertyKey, target, propertyKey);

        if (descriptor) {
            return descriptor;
        }
    };
}
