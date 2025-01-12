import {
    ArrayValue,
    BooleanValue,
    EmptyValue,
    FloatValue,
    IntegerValue,
    LiteralStringValue,
    NestedObjectValue,
    PlainObjectValue,
    PropertyKVPair,
    QuotedStringValue,
    ValueType,
    ValueWithTypeInfo,
} from "../parser/GkmsScenarioParserModels";
import StringBuilder from "../../StringBuilder";
import type { $Undefinable, StaticClass } from "../../TypeHelpers";

interface IWriteContext {
    readonly valueStack: readonly ValueWithTypeInfo[];

    push(value: ValueWithTypeInfo): void;

    pop(): void;

    getParent(): $Undefinable<ValueWithTypeInfo>;
}

class WriteContext implements IWriteContext {
    constructor() {
        this.valueStack = [];
    }

    readonly valueStack: ValueWithTypeInfo[];

    push(value: ValueWithTypeInfo): void {
        this.valueStack.push(value);
    }

    pop(): void {
        this.valueStack.pop();
    }

    getParent(): $Undefinable<ValueWithTypeInfo> {
        return this.valueStack[this.valueStack.length - 1];
    }
}

class NotationWriterStatic {
    static writeTo(notation: ValueWithTypeInfo, stringBuilder: StringBuilder): void {
        return this.write(notation, stringBuilder);
    }

    private static write(d: ValueWithTypeInfo, stringBuilder: StringBuilder): void {
        const writeContext = new WriteContext();
        this.writeCore(writeContext, d, stringBuilder);
    }

    private static writeCore(context: IWriteContext, d: ValueWithTypeInfo, stringBuilder: StringBuilder): void {
        switch (d.type) {
            case ValueType.quotedString:
                return this.writeQuotedString(context, d, stringBuilder);
            case ValueType.literalString:
                return this.writeLiteralString(context, d, stringBuilder);
            case ValueType.float:
                return this.writeFloat(context, d, stringBuilder);
            case ValueType.integer:
                return this.writeInteger(context, d, stringBuilder);
            case ValueType.boolean:
                return this.writeBoolean(context, d, stringBuilder);
            case ValueType.empty:
                return this.writeEmpty(context, d, stringBuilder);
            case ValueType.array:
                return this.writeArray(context, d, stringBuilder);
            case ValueType.plainObject:
                return this.writePlainObject(context, d, stringBuilder);
            case ValueType.nestedObject:
                return this.writeNestedObject(context, d, stringBuilder);
        }
    }

    private static writeQuotedString(context: IWriteContext, d: QuotedStringValue, stringBuilder: StringBuilder): void {
        if (d.value) {
            stringBuilder.append('"');
            stringBuilder.append(d.value);
            stringBuilder.append('"');
        } else {
            stringBuilder.append('""');
        }
    }

    private static writeLiteralString(
        context: IWriteContext,
        d: LiteralStringValue,
        stringBuilder: StringBuilder
    ): void {
        stringBuilder.append(d.value);
    }

    private static writeFloat(context: IWriteContext, d: FloatValue, stringBuilder: StringBuilder): void {
        let numStr = d.value.toString();

        if (!d.writeOptions?.trimFloatNumbers) {
            if (!numStr.includes(".")) {
                numStr += ".0";
            }
        }

        stringBuilder.append(numStr);
    }

    private static writeInteger(context: IWriteContext, d: IntegerValue, stringBuilder: StringBuilder): void {
        const numStr = d.value.toString();
        stringBuilder.append(numStr);
    }

    private static writeBoolean(context: IWriteContext, d: BooleanValue, stringBuilder: StringBuilder): void {
        // Does not matter inside plain or nested object.
        stringBuilder.append(d.value ? "true" : "false");
    }

    private static writeEmpty(context: IWriteContext, d: EmptyValue, stringBuilder: StringBuilder): void {
        void d;
        void stringBuilder;
        // Literally don't write anything
    }

    private static writeArray(context: IWriteContext, d: ArrayValue, stringBuilder: StringBuilder): void {
        context.push(d);

        stringBuilder.append("[");

        const items = d.value;
        const itemCount = items.length;
        if (itemCount > 0) {
            for (let i = 0; i < itemCount; i++) {
                this.writeCore(context, items[i], stringBuilder);

                if (i < itemCount - 1) {
                    stringBuilder.append(",");
                }
            }
        }

        stringBuilder.append("]");
    }

    private static writePlainObject(context: IWriteContext, d: PlainObjectValue, stringBuilder: StringBuilder): void {
        context.push(d);

        stringBuilder.append("[");

        stringBuilder.append(d.value.objectTag);

        const properties = d.value.properties;
        const propertyCount = properties.length;
        if (propertyCount > 0) {
            for (let i = 0; i < propertyCount; i++) {
                const prop = properties[i];
                this.writePlainObjectProperty(context, prop, i, propertyCount, stringBuilder);
            }
        }

        stringBuilder.append("]");

        context.pop();
    }

    private static writePlainObjectProperty(
        context: IWriteContext,
        p: PropertyKVPair,
        index: number,
        count: number,
        stringBuilder: StringBuilder
    ): void {
        if (p.value.type === ValueType.array) {
            for (const item of p.value.value) {
                stringBuilder.append(" ");

                this.writeCore(context, p.key, stringBuilder);
                stringBuilder.append("=");
                this.writeCore(context, item, stringBuilder);
            }
        } else {
            stringBuilder.append(" ");

            this.writeCore(context, p.key, stringBuilder);
            stringBuilder.append("=");
            this.writeCore(context, p.value, stringBuilder);
        }
    }

    private static writeNestedObject(context: IWriteContext, d: NestedObjectValue, stringBuilder: StringBuilder): void {
        context.push(d);

        stringBuilder.append("\\{");

        if (d.value.namespaceTag) {
            stringBuilder.append(d.value.namespaceTag);
            stringBuilder.append("::");
        }

        const properties = d.value.properties;
        const propertyCount = properties.length;
        if (propertyCount > 0) {
            for (let i = 0; i < propertyCount; i++) {
                const prop = properties[i];
                this.writeNestedObjectProperty(context, prop, i, propertyCount, stringBuilder);
            }
        }

        stringBuilder.append("\\}");

        context.pop();
    }

    private static writeNestedObjectProperty(
        context: IWriteContext,
        p: PropertyKVPair,
        index: number,
        count: number,
        stringBuilder: StringBuilder
    ): void {
        this.writeCore(context, p.key, stringBuilder);
        stringBuilder.append(":");
        this.writeCore(context, p.value, stringBuilder);

        if (index < count - 1) {
            stringBuilder.append(",");
        }
    }
}

const NotationWriter = NotationWriterStatic as StaticClass<typeof NotationWriterStatic>;
export default NotationWriter;
