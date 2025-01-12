import { DataFieldWriteOptions } from "../../annotations/DataModelAnnotations";

export const enum ValueType {
    unknown = 0,
    quotedString,
    literalString,
    float,
    integer,
    enum = integer,
    boolean,
    empty,
    array,
    plainObject,
    nestedObject,
}

interface BaseValueWithTypeInfo<T = unknown> {
    type: ValueType;
    value: T;
    writeOptions?: DataFieldWriteOptions;
}

export type ValueWithTypeInfo = ObjectPropertyValue;

export interface QuotedStringValue extends BaseValueWithTypeInfo<string> {
    type: ValueType.quotedString;
}

export interface LiteralStringValue extends BaseValueWithTypeInfo<string> {
    type: ValueType.literalString;
}

export interface FloatValue extends BaseValueWithTypeInfo<number> {
    type: ValueType.float;
}

export interface IntegerValue extends BaseValueWithTypeInfo<number> {
    type: ValueType.integer;
}

export interface BooleanValue extends BaseValueWithTypeInfo<boolean> {
    type: ValueType.boolean;
}

export interface EmptyValue extends BaseValueWithTypeInfo<null> {
    type: ValueType.empty;
    value: null;
}

export interface ArrayValue extends BaseValueWithTypeInfo<ObjectPropertyValue[]> {
    type: ValueType.array;
}

export type ObjectPropertyKey = QuotedStringValue | LiteralStringValue;
type Value =
    | NestedObjectValue
    | PlainObjectValue
    | QuotedStringValue
    | FloatValue
    | IntegerValue
    | BooleanValue
    | ArrayValue
    | LiteralStringValue;
export type ObjectPropertyValue = Value | EmptyValue;

export interface PropertyKVPair {
    key: ObjectPropertyKey;
    value: ObjectPropertyValue;
}

interface NestedObject {
    namespaceTag: string | null;
    properties: PropertyKVPair[];
}

export interface NestedObjectValue extends BaseValueWithTypeInfo<NestedObject> {
    type: ValueType.nestedObject;
}

interface PlainObject {
    objectTag: string;
    properties: PropertyKVPair[];
}

export interface PlainObjectValue extends BaseValueWithTypeInfo<PlainObject> {
    type: ValueType.plainObject;
}
