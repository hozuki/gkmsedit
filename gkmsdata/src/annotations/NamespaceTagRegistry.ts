import MetadataKeys from "./MetadataKeys";
import DataModelObject from "../model/DataModelObject";
import { $Undefinable, StaticClass } from "../TypeHelpers";

type BasicClassConstructor = new (...params: unknown[]) => object;

/**
 * Used with {@link NestedObject}s to provide namespace tag info. Nested objects are anonymous, but they can have
 * namespaces. For example:
 * ```
 * ease=AnimationCurve::\{"_curve": ...\}
 * ```
 * This object, being the value of property `ease`, has a namespace tag `AnimationCurve`, and a property `curve`.
 * In contrast, nested objects without namespace tags are used this:
 * ```
 * clip=\{"_startTime": ...\}
 * ```
 * @param tag The namespace tag.
 * @example
 */
export function namespaceTag(tag: string) {
    return function <T extends BasicClassConstructor>(constructor: T): T {
        if (tag) {
            Reflect.defineMetadata(MetadataKeys.RegisteredNamespaceTag, tag, constructor);

            Object.defineProperty(constructor, MetadataKeys.RegisteredNamespaceTag, {
                value: tag,
                writable: false,
                enumerable: true,
                configurable: true,
            });
        }

        return constructor;
    };
}

class NamespaceTagStatic {
    static getNamespaceTag(dataModel: DataModelObject): $Undefinable<string> {
        return Reflect.getMetadata(MetadataKeys.RegisteredNamespaceTag, dataModel);
    }
}

const NamespaceTag = NamespaceTagStatic as StaticClass<typeof NamespaceTagStatic>;
export { NamespaceTag };
