import type { StaticObject } from "../TypeHelpers";

const MetadataKeysOriginal = {
    DataClass: Symbol("@dataClass"),
    DataField: Symbol("@dataField"),
    DataProperty: Symbol("@dataProperty"),
    OriginalMemberName: Symbol("@originalMemberName"),
    RegisteredObjectTag: Symbol("@registeredObjectTag"),
    RegisteredNamespaceTag: Symbol("@registeredNamespaceTag"),
};

const MetadataKeys = MetadataKeysOriginal as Readonly<StaticObject<typeof MetadataKeysOriginal>>;
export default MetadataKeys;
