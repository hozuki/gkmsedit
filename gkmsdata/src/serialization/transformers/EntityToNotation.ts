import {
    ArrayValue,
    BooleanValue,
    EmptyValue,
    FloatValue,
    IntegerValue,
    LiteralStringValue,
    NestedObjectValue,
    ObjectPropertyKey,
    ObjectPropertyValue,
    PlainObjectValue,
    PropertyKVPair,
    QuotedStringValue,
    ValueType,
    ValueWithTypeInfo,
} from "../parser/GkmsScenarioParserModels";
import type DataModelObject from "../../model/DataModelObject";
import {
    BuiltInObjectType,
    DataClassType,
    FieldType,
    ObjectType,
    ObjectTypeHelper,
    RuntimeDataClassProps,
    RuntimeDataFieldProps,
} from "../../annotations/DataModelAnnotations";
import MetadataKeys from "../../annotations/MetadataKeys";
import type { $Nullable, $Undefinable } from "../../TypeHelpers";
import BuiltinDataClassProps from "../../model/BuiltinDataClassProps";
import { ObjectTag } from "../../annotations/ObjectTagRegistry";
import { NamespaceTag } from "../../annotations/NamespaceTagRegistry";
import WellKnownObjectTags from "../../model/WellKnownObjectTags";
import DataModelHelper from "../../model/DataModelHelper";
import IEntityToNotationTransformationContext from "./IEntityToNotationTransformationContext";
import ObjectScopeKind from "./ObjectScopeKind";
import EntityString from "../sanitizers/EntityString";

// Used to help determine whether the closest parent of the node we are currently handling is a plain object or a nested
// object.
class E2NContext implements IEntityToNotationTransformationContext {
    pushObjectScope(kind: ObjectScopeKind): void {
        this._scopeStack.push(kind);
    }

    popObjectScope(): boolean {
        const v = this._scopeStack.pop();
        return typeof v !== "undefined";
    }

    getCurrentObjectScope(): ObjectScopeKind {
        const scopeStack = this._scopeStack;
        if (scopeStack.length > 0) {
            return scopeStack[scopeStack.length - 1];
        } else {
            return ObjectScopeKind.unknown;
        }
    }

    private readonly _scopeStack: ObjectScopeKind[] = [];
}

function createWithTypeHint<T extends object>(value: T): T {
    return value;
}

export class EntityToNotationTransformer {
    constructor(dataModels: readonly DataModelObject[]) {
        this._classRealNameToDeclaredNames = new Map<string, string>();
        this._dataModels = new Map<string, DataModelObject>();
        this._classProps = new Map<string, RuntimeDataClassProps>();
        this._fieldProps = new Map<string, Map<string, RuntimeDataFieldProps>>();
        this.#initProps(dataModels);
    }

    transform(object: Readonly<Record<PropertyKey, unknown>>, tag: string): ValueWithTypeInfo;
    transform<TTag extends WellKnownObjectTags>(
        object: Readonly<Record<PropertyKey, unknown>>,
        tag: TTag
    ): ValueWithTypeInfo;
    transform(object: Readonly<Record<PropertyKey, unknown>>, tag: string): ValueWithTypeInfo {
        const dataModel = DataModelHelper.getDataModelByTag(tag);

        if (!dataModel) {
            throw new TypeError(`cannot find data model for tag "${tag}" to serialize`);
        }

        const declaredName = this._classRealNameToDeclaredNames.get(dataModel.name);
        if (!declaredName) {
            throw new TypeError(`class name "${dataModel.name}" is not registered`);
        }

        const classProps = this.#getClassPropByName(declaredName);
        if (!classProps) {
            throw new TypeError(`property list for class "${dataModel.name}" is not registered`);
        }

        const e2nContext = new E2NContext();

        return this.#transformValue(e2nContext, object, classProps, undefined, undefined);
    }

    #fillProperties(
        context: IEntityToNotationTransformationContext,
        object: Readonly<Record<PropertyKey, unknown>>,
        containerClassProps: RuntimeDataClassProps,
        properties: PropertyKVPair[]
    ): void {
        const fieldPropsMap = this._fieldProps.get(containerClassProps.name);
        if (!fieldPropsMap || fieldPropsMap.size === 0) {
            return;
        }

        for (const [fieldName, fieldProps] of fieldPropsMap) {
            if (Object.hasOwn(object, fieldName)) {
                const propValue = object[fieldName];
                const property = this.#transformProperty(context, propValue, containerClassProps, fieldProps);

                if (property) {
                    properties.push(property);
                }
            }
        }
    }

    #transformProperty(
        context: IEntityToNotationTransformationContext,
        value: unknown,
        containerClassProps: RuntimeDataClassProps,
        fieldProps: RuntimeDataFieldProps
    ): $Nullable<PropertyKVPair> {
        const throwTypeMismatch = (expectedType: string): never => {
            throw new TypeError(
                `field types mismatch when processing ${containerClassProps.name}.${fieldProps.name}, expected ${expectedType}`
            );
        };

        const objectScopeKind = context.getCurrentObjectScope();

        let propValue: $Undefinable<ObjectPropertyValue> = undefined;
        switch (fieldProps.type) {
            case FieldType.string: {
                if (objectScopeKind === ObjectScopeKind.plain) {
                    if (typeof value === "string") {
                        propValue = createWithTypeHint<LiteralStringValue>({
                            type: ValueType.literalString,
                            value: EntityString.escapeLiteral(value),
                            writeOptions: fieldProps.writeOptions,
                        });
                    } else {
                        if (fieldProps.optional) {
                            if (fieldProps.missingValue !== undefined) {
                                propValue = createWithTypeHint<LiteralStringValue>({
                                    type: ValueType.literalString,
                                    value: EntityString.escapeLiteral(fieldProps.missingValue as string),
                                    writeOptions: fieldProps.writeOptions,
                                });
                            }
                        } else {
                            throwTypeMismatch("string");
                        }
                    }
                } else if (objectScopeKind === ObjectScopeKind.nested) {
                    if (typeof value === "string") {
                        propValue = createWithTypeHint<QuotedStringValue>({
                            type: ValueType.quotedString,
                            value: EntityString.escapeQuoted(value),
                            writeOptions: fieldProps.writeOptions,
                        });
                    } else {
                        if (fieldProps.optional) {
                            if (fieldProps.missingValue !== undefined) {
                                propValue = createWithTypeHint<QuotedStringValue>({
                                    type: ValueType.quotedString,
                                    value: EntityString.escapeQuoted(fieldProps.missingValue as string),
                                    writeOptions: fieldProps.writeOptions,
                                });
                            }
                        } else {
                            throwTypeMismatch("string");
                        }
                    }
                } else {
                    throw new TypeError(
                        `insufficient information of object scope kind ${objectScopeKind} to transform string`
                    );
                }
                break;
            }
            case FieldType.float: {
                if (typeof value === "number") {
                    propValue = createWithTypeHint<FloatValue>({
                        type: ValueType.float,
                        value: value,
                        writeOptions: fieldProps.writeOptions,
                    });
                } else {
                    if (fieldProps.optional) {
                        if (fieldProps.missingValue !== undefined) {
                            const numValue = Number(fieldProps.missingValue);
                            propValue = createWithTypeHint<FloatValue>({
                                type: ValueType.float,
                                value: numValue,
                                writeOptions: fieldProps.writeOptions,
                            });
                        }
                    } else {
                        throwTypeMismatch("number");
                    }
                }
                break;
            }
            case FieldType.integer: {
                if (typeof value === "number") {
                    propValue = createWithTypeHint<IntegerValue>({
                        type: ValueType.integer,
                        value: Math.round(value),
                        writeOptions: fieldProps.writeOptions,
                    });
                } else {
                    if (fieldProps.optional) {
                        if (fieldProps.missingValue !== undefined) {
                            const numValue = Number(fieldProps.missingValue);
                            propValue = createWithTypeHint<IntegerValue>({
                                type: ValueType.integer,
                                value: Math.round(numValue),
                                writeOptions: fieldProps.writeOptions,
                            });
                        }
                    } else {
                        throwTypeMismatch("number");
                    }
                }
                break;
            }
            case FieldType.boolean: {
                if (typeof value === "boolean") {
                    propValue = createWithTypeHint<BooleanValue>({
                        type: ValueType.boolean,
                        value: value,
                        writeOptions: fieldProps.writeOptions,
                    });
                } else {
                    if (fieldProps.optional) {
                        if (fieldProps.missingValue !== undefined) {
                            propValue = createWithTypeHint<BooleanValue>({
                                type: ValueType.boolean,
                                value: fieldProps.missingValue as boolean,
                                writeOptions: fieldProps.writeOptions,
                            });
                        }
                    } else {
                        throwTypeMismatch("boolean");
                    }
                }
                break;
            }
            case FieldType.empty: {
                propValue = createWithTypeHint<EmptyValue>({
                    type: ValueType.empty,
                    value: null,
                });
                break;
            }
            case FieldType.array: {
                if (Array.isArray(value)) {
                    let refClassProp: $Undefinable<RuntimeDataClassProps> = undefined;
                    if (fieldProps.typeRef) {
                        refClassProp = this.#getClassPropByName(fieldProps.typeRef);
                    }

                    if (!refClassProp) {
                        // cannot handle missing type info
                        return null;
                    }

                    propValue = createWithTypeHint<ArrayValue>({
                        type: ValueType.array,
                        value: [],
                        writeOptions: fieldProps.writeOptions,
                    });

                    for (const item of value) {
                        const obj = this.#transformValue(context, item, refClassProp, fieldProps, containerClassProps);
                        propValue.value.push(obj);
                    }
                } else {
                    if (fieldProps.optional) {
                        if (fieldProps.missingValue !== undefined) {
                            propValue = createWithTypeHint<ArrayValue>({
                                type: ValueType.array,
                                value: fieldProps.missingValue as [],
                                writeOptions: fieldProps.writeOptions,
                            });
                        }
                    } else {
                        throw new TypeError("cannot serialize an object that is not an array as an array");
                    }
                }

                break;
            }
            case FieldType.plainObject:
            case FieldType.nestedObject: {
                let refClassProp: $Undefinable<RuntimeDataClassProps> = undefined;

                if (fieldProps.typeRef) {
                    refClassProp = this.#getClassPropByName(fieldProps.typeRef);
                }

                if (!refClassProp) {
                    // cannot handle missing type info
                    return null;
                }

                propValue = this.#transformValue(context, value, refClassProp, fieldProps, containerClassProps);
                break;
            }
            default:
                // type is not invalid, ignored
                return null;
        }

        if (!propValue) {
            return null;
        }

        let propKey: ObjectPropertyKey;
        // Not sure about this logic but it looks reasonable...
        if (objectScopeKind === ObjectScopeKind.plain) {
            propKey = createWithTypeHint<LiteralStringValue>({
                type: ValueType.literalString,
                // Don't escape property keys.
                value: fieldProps.name,
            });
        } else if (objectScopeKind === ObjectScopeKind.nested) {
            propKey = createWithTypeHint<QuotedStringValue>({
                type: ValueType.quotedString,
                // Don't escape property keys.
                value: fieldProps.name,
            });
        } else {
            throw new TypeError(`unknown container object scope kind ${objectScopeKind} when generating property key`);
        }

        return { key: propKey, value: propValue };
    }

    #transformValue(
        context: IEntityToNotationTransformationContext,
        value: unknown,
        fieldClassProps: RuntimeDataClassProps,
        fieldProps: $Undefinable<RuntimeDataFieldProps>,
        containerClassProps: $Undefinable<RuntimeDataClassProps>
    ): ValueWithTypeInfo {
        let result: ValueWithTypeInfo;

        const objectType = EntityToNotationTransformer.#tryDetermineObjectType(fieldClassProps, fieldProps);
        if (objectType === BuiltInObjectType.unset) {
            throw new TypeError(
                `cannot determine object type: field "${fieldProps?.name ?? "(undefined)"}", value: ${value}`
            );
        }

        switch (objectType) {
            case ObjectType.plain: {
                const dataModel = this._dataModels.get(fieldClassProps.name)!;
                const objectTag = ObjectTag.getObjectTag(dataModel);

                const obj: PlainObjectValue = {
                    type: ValueType.plainObject,
                    value: {
                        objectTag: objectTag || "ERROR_UNSET",
                        properties: [],
                    },
                    writeOptions: fieldProps?.writeOptions,
                };

                const object = value as Readonly<Record<PropertyKey, unknown>>;

                context.pushObjectScope(ObjectScopeKind.plain);
                this.#fillProperties(context, object, fieldClassProps, obj.value.properties);
                context.popObjectScope();

                result = obj;

                break;
            }
            case ObjectType.nested: {
                const dataModel = this._dataModels.get(fieldClassProps.name)!;
                const namespaceTag = NamespaceTag.getNamespaceTag(dataModel);

                const obj: NestedObjectValue = {
                    type: ValueType.nestedObject,
                    value: {
                        namespaceTag: namespaceTag || null,
                        properties: [],
                    },
                    writeOptions: fieldProps?.writeOptions,
                };

                const object = value as Readonly<Record<PropertyKey, unknown>>;

                context.pushObjectScope(ObjectScopeKind.nested);
                this.#fillProperties(context, object, fieldClassProps, obj.value.properties);
                context.popObjectScope();

                result = obj;

                break;
            }
            case BuiltInObjectType.string: {
                // Not sure about this logic but it looks reasonable...
                if (containerClassProps && containerClassProps.objectType === ObjectType.plain) {
                    result = createWithTypeHint<LiteralStringValue>({
                        type: ValueType.literalString,
                        value: EntityString.escapeLiteral(value as string),
                        writeOptions: fieldProps?.writeOptions,
                    });
                } else {
                    result = createWithTypeHint<QuotedStringValue>({
                        type: ValueType.quotedString,
                        value: EntityString.escapeQuoted(value as string),
                        writeOptions: fieldProps?.writeOptions,
                    });
                }
                break;
            }
            case BuiltInObjectType.float: {
                result = createWithTypeHint<FloatValue>({
                    type: ValueType.float,
                    value: value as number,
                    writeOptions: fieldProps?.writeOptions,
                });
                break;
            }
            case BuiltInObjectType.integer: {
                result = createWithTypeHint<IntegerValue>({
                    type: ValueType.integer,
                    value: value as number,
                    writeOptions: fieldProps?.writeOptions,
                });
                break;
            }
            case BuiltInObjectType.boolean: {
                result = createWithTypeHint<BooleanValue>({
                    type: ValueType.boolean,
                    value: value as boolean,
                    writeOptions: fieldProps?.writeOptions,
                });
                break;
            }
            case BuiltInObjectType.empty: {
                if (fieldProps) {
                    if (fieldProps.type === FieldType.string) {
                        // Not sure about this logic but it looks reasonable...
                        if (containerClassProps && containerClassProps.objectType === ObjectType.plain) {
                            result = createWithTypeHint<LiteralStringValue>({
                                type: ValueType.literalString,
                                value: "",
                                writeOptions: fieldProps?.writeOptions,
                            });
                        } else {
                            result = createWithTypeHint<QuotedStringValue>({
                                type: ValueType.quotedString,
                                value: "",
                                writeOptions: fieldProps?.writeOptions,
                            });
                        }
                    } else {
                        result = createWithTypeHint<EmptyValue>({
                            type: ValueType.empty,
                            value: null,
                            writeOptions: fieldProps?.writeOptions,
                        });
                    }
                } else {
                    result = createWithTypeHint<EmptyValue>({
                        type: ValueType.empty,
                        value: null,
                        writeOptions: undefined,
                    });
                }
                break;
            }
            default:
                throw new TypeError(`unexpected classProps.objectType: ${fieldClassProps.objectType}`);
        }

        return result;
    }

    #initProps(dataModels: readonly DataModelObject[]): void {
        for (const dataModel of dataModels) {
            const hasClassProps = Reflect.hasMetadata(MetadataKeys.DataClass, dataModel);

            if (!hasClassProps) {
                // Not a data model class
                continue;
            }
            const classProps = Reflect.getMetadata(MetadataKeys.DataClass, dataModel) as RuntimeDataClassProps;

            this._classRealNameToDeclaredNames.set(dataModel.name, classProps.name);
            this._dataModels.set(classProps.name, dataModel);
            this._classProps.set(classProps.name, classProps);

            const memberNames = Object.keys(dataModel);

            for (const memberName of memberNames) {
                const hasFieldProps = Reflect.hasMetadata(MetadataKeys.DataField, dataModel, memberName);

                if (hasFieldProps) {
                    const fieldProps = Reflect.getMetadata(MetadataKeys.DataField, dataModel, memberName);

                    let map = this._fieldProps.get(classProps.name);
                    if (!map) {
                        map = new Map<string, RuntimeDataFieldProps>();
                        this._fieldProps.set(classProps.name, map);
                    }

                    // Using actual name as key
                    map.set(memberName, fieldProps);
                }
            }
        }
    }

    #getClassPropByName(declaredName: string): $Undefinable<RuntimeDataClassProps> {
        let props = this._classProps.get(declaredName);
        if (props) {
            return props;
        }

        props = BuiltinDataClassProps.resolve(declaredName);
        return props;
    }

    static #tryDetermineObjectType(
        fieldClassProps: RuntimeDataClassProps,
        fieldProps: $Undefinable<RuntimeDataFieldProps>
    ): DataClassType {
        let objectType: DataClassType = BuiltInObjectType.unset;

        if (fieldProps) {
            // Try to guess the object type of the class from the referencing field.
            if (fieldProps.type !== FieldType.array) {
                objectType = ObjectTypeHelper.fieldTypeToObjectType(fieldProps.type);
            } else {
                if (typeof fieldProps.itemsObjectTypeHint !== "undefined") {
                    objectType = fieldProps.itemsObjectTypeHint;
                }
            }
        }

        // If guess failed, try to use the @dataClass annotated value on the data class.
        if (objectType === BuiltInObjectType.unset) {
            objectType = fieldClassProps.objectType;
        }

        return objectType;
    }

    private readonly _classRealNameToDeclaredNames: Map<string, string>;
    private readonly _dataModels: Map<string, DataModelObject>;
    // Keys are declared names
    private readonly _classProps: Map<string, RuntimeDataClassProps>;
    // Class keys are declared names, and field keys are their actual names.
    //
    // e.g.:
    //
    // @dataField({name:"declared"})
    // static fieldName: number = undefined!;
    //
    // declared name: "declared"
    // actual name: "fieldName"
    //
    // Using actual names here is for fast lookups, avoiding extra Reflect API calls.
    private readonly _fieldProps: Map<string, Map<string, RuntimeDataFieldProps>>;
}
