import {
    FieldType,
    ObjectType,
    RuntimeDataClassProps,
    RuntimeDataFieldProps,
} from "../../annotations/DataModelAnnotations";
import MetadataKeys from "../../annotations/MetadataKeys";
import type DataModelObject from "../../model/DataModelObject";
import {
    ArrayValue,
    PlainObjectValue,
    PropertyKVPair,
    ValueType,
    ValueWithTypeInfo,
} from "../parser/GkmsScenarioParserModels";
import type { $Nullable, $Undefinable } from "../../TypeHelpers";
import BuiltinDataClassProps from "../../model/BuiltinDataClassProps";
import DataModelHelper from "../../model/DataModelHelper";
import WellKnownObjectTags from "../../model/WellKnownObjectTags";
import WellKnownObjectTagToDataModelObject from "../../model/WellKnownObjectTagToDataModelObject";
import Logger from "js-logger";
import NotationString from "../sanitizers/NotationString";

export class NotationToEntityTransformer {
    constructor(rules: readonly DataModelObject[]) {
        this._classRealNameToDeclaredNames = new Map<string, string>();
        this._classProps = new Map<string, RuntimeDataClassProps>();
        this._fieldProps = new Map<string, Map<string, RuntimeDataFieldProps>>();
        this.#initProps(rules);
    }

    transform(notation: PlainObjectValue): object;
    transform<TTag extends WellKnownObjectTags>(
        notation: PlainObjectValue,
        tagHint: Extract<TTag, WellKnownObjectTags>
    ): WellKnownObjectTagToDataModelObject[TTag];
    transform(notation: PlainObjectValue, tagHint?: string): object {
        const dataModel = DataModelHelper.getDataModelByTag(notation.value.objectTag);

        if (!dataModel) {
            throw new TypeError(`cannot find data model for tag "${notation.value.objectTag}" to deserialize`);
        }

        const declaredName = this._classRealNameToDeclaredNames.get(dataModel.name);
        if (!declaredName) {
            throw new TypeError(`class name "${dataModel.name}" is not registered`);
        }

        const classProps = this.#getClassPropByName(declaredName);
        if (!classProps) {
            throw new TypeError(`property list for class "${dataModel.name}" is not registered`);
        }

        return this.#transformInternal(notation, classProps) as object;
    }

    transformAs<T extends object>(notation: PlainObjectValue): T {
        return this.transform(notation) as T;
    }

    #transformInternal(notation: ValueWithTypeInfo, classProps: $Undefinable<RuntimeDataClassProps>): unknown {
        switch (notation.type) {
            case ValueType.quotedString:
                return NotationString.unescapeQuoted(notation.value);
            case ValueType.literalString:
                return NotationString.unescapeLiteral(notation.value);
            case ValueType.float:
            case ValueType.integer:
                return notation.value;
            case ValueType.boolean:
                return notation.value;
            case ValueType.empty:
                return null;
            case ValueType.array: {
                // Not allowed; one-dimensional array only
                break;
            }
            case ValueType.plainObject: {
                if (classProps) {
                    return this.#fillObjectProperties(notation.value.properties, classProps);
                } else {
                    throw new TypeError("must provide a valid rule to transform objects");
                }
            }
            case ValueType.nestedObject: {
                if (classProps) {
                    return this.#fillObjectProperties(notation.value.properties, classProps);
                } else {
                    throw new TypeError("must provide a valid rule to transform objects");
                }
            }
        }

        throw new TypeError("wrong value type");
    }

    #fillObjectProperties(properties: $Nullable<readonly PropertyKVPair[]>, classProps: RuntimeDataClassProps): object {
        const result: Record<string, unknown> = Object.create(null);

        const fieldPropsMap = this._fieldProps.get(classProps.name);

        if (fieldPropsMap) {
            if (properties && properties.length > 0) {
                for (const { key: propKeyNode, value: propValueNode } of properties) {
                    const fieldProps = fieldPropsMap.get(propKeyNode.value);

                    if (fieldProps) {
                        const [ok, value] = this.#getFieldValue(propValueNode, fieldProps);

                        if (ok) {
                            if (fieldProps.type === FieldType.array) {
                                if (typeof fieldProps.itemsObjectTypeHint !== "undefined") {
                                    if (fieldProps.itemsObjectTypeHint === ObjectType.plain) {
                                        // Plain objects have array members defined incrementally (with same repeated property keys)
                                        let array = result[fieldProps.originalName] as $Undefinable<unknown[]>;

                                        if (!array) {
                                            array = [];
                                            result[fieldProps.originalName] = array;
                                        }

                                        array.push(value);
                                    } else if (fieldProps.itemsObjectTypeHint === ObjectType.nested) {
                                        // Nested objects always have array members defined explicitly
                                        result[fieldProps.originalName] = value;
                                    }
                                }
                            } else {
                                result[fieldProps.originalName] = value;
                            }
                        }
                    }
                }
            }

            // Check for properties that are defined in the schema, but missing in notation
            for (const [propName, fieldProps] of fieldPropsMap) {
                if (Object.hasOwn(result, fieldProps.originalName)) {
                    continue;
                }

                if (fieldProps.optional) {
                    continue;
                }

                let shouldCategorizeAsError = true;
                let message: $Undefinable<string> = undefined;

                let nullValue = fieldProps.missingValue;

                if (fieldProps.type === FieldType.array) {
                    if (typeof nullValue === "undefined") {
                        message = `${classProps.name} : Field value is missing and the field is not marked as nullable: ${propName}; setting to empty array`;
                        shouldCategorizeAsError = false;
                        nullValue = [];
                    }
                }

                if (!message) {
                    message = `${classProps.name} : Field value is missing and the field is not marked as nullable: ${propName}`;
                }

                if (shouldCategorizeAsError) {
                    Logger.error(message);
                } else {
                    Logger.warn(message);
                }

                if (typeof nullValue !== "undefined") {
                    result[fieldProps.originalName] = nullValue;
                }
            }
        }

        return result;
    }

    #getFieldValue(notation: ValueWithTypeInfo, fieldProps: RuntimeDataFieldProps): [boolean, unknown] {
        switch (notation.type) {
            case ValueType.quotedString:
                return [true, NotationString.unescapeQuoted(notation.value)];
            case ValueType.literalString:
                return [true, NotationString.unescapeLiteral(notation.value)];
            case ValueType.float:
            case ValueType.integer:
                return [true, notation.value];
            case ValueType.boolean:
                return [true, notation.value];
            case ValueType.empty: {
                if (fieldProps.type === FieldType.string) {
                    if (fieldProps.missingValue) {
                        return [true, fieldProps.missingValue];
                    } else {
                        return [true, ""];
                    }
                } else {
                    return [true, fieldProps.missingValue];
                }
            }
            case ValueType.array: {
                let refClassProps: $Undefinable<RuntimeDataClassProps> = undefined;

                if (fieldProps.typeRef) {
                    refClassProps = this.#getClassPropByName(fieldProps.typeRef);
                }

                const sourceArray = (notation as ArrayValue).value;
                const result: unknown[] = [];

                for (const item of sourceArray) {
                    const itemValue = this.#transformInternal(item, refClassProps);
                    result.push(itemValue);
                }

                return [true, result];
            }
            case ValueType.plainObject:
            case ValueType.nestedObject: {
                let refClassProps: $Undefinable<RuntimeDataClassProps> = undefined;

                if (fieldProps.typeRef) {
                    refClassProps = this.#getClassPropByName(fieldProps.typeRef);
                }

                if (!refClassProps) {
                    throw new TypeError(
                        `must provide a valid rule to transform notation to entity (field: ${fieldProps.name})`
                    );
                }

                const objectValue = this.#transformInternal(notation, refClassProps);
                return [true, objectValue];
            }
        }

        return [false, undefined];
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

                    // Using declared name as key
                    map.set(fieldProps.name, fieldProps);
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

    private readonly _classRealNameToDeclaredNames: Map<string, string>;
    // Keys are declared names
    private readonly _classProps: Map<string, RuntimeDataClassProps>;
    // Since this transformer transforms raw deserialized objects to the JavaScript entities, we use the names in
    // gakumas data as keys here for fast queries. They are NOT NECESSARILY the same as JavaScript object member's
    // actual name.
    private readonly _fieldProps: Map<string, Map<string, RuntimeDataFieldProps>>;
}
