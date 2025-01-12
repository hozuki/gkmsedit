import MetadataKeys from "./MetadataKeys";
import DataModelObject from "../model/DataModelObject";
import { $Undefinable, StaticClass } from "../TypeHelpers";

type BasicClassConstructor = new (...params: unknown[]) => object;

export const $gObjectTagToDataModelObject = new Map<string, DataModelObject>();

/**
 * Used with {@link PlainObject}s to provide object tag info. For example:
 * ```
 * [crowdgroup crowds=...]
 * ```
 * This object has object tag `crowdgroup`, and a property `crowds`.
 * @param tag The object tags. Multiple tags can be mapped to the same data model object.
 * @example
 */
export function objectTag(tag: string) {
    return function <T extends BasicClassConstructor>(constructor: T): T {
        if (tag) {
            Reflect.defineMetadata(MetadataKeys.RegisteredObjectTag, tag, constructor);
            $gObjectTagToDataModelObject.set(tag, constructor);

            Object.defineProperty(constructor, MetadataKeys.RegisteredObjectTag, {
                value: tag,
                writable: false,
                enumerable: true,
                configurable: true,
            });
        }

        return constructor;
    };
}

class ObjectTagStatic {
    static getObjectTag(dataModel: DataModelObject): $Undefinable<string> {
        return Reflect.getMetadata(MetadataKeys.RegisteredObjectTag, dataModel);
    }
}

const ObjectTag = ObjectTagStatic as StaticClass<typeof ObjectTagStatic>;
export { ObjectTag };
