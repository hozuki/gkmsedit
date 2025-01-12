import { BuiltInObjectType, RuntimeDataClassProps } from "../annotations/DataModelAnnotations";
import { $Undefinable, StaticClass } from "../TypeHelpers";
import BuiltInObjectTags from "./BuiltInObjectTags";

const $builtinClassProps: RuntimeDataClassProps[] = [
    {
        name: BuiltInObjectTags.string,
        objectType: BuiltInObjectType.string,
    },
    {
        name: BuiltInObjectTags.float,
        objectType: BuiltInObjectType.float,
    },
    {
        name: BuiltInObjectTags.integer,
        objectType: BuiltInObjectType.integer,
    },
    {
        name: BuiltInObjectTags.boolean,
        objectType: BuiltInObjectType.boolean,
    },
    {
        name: BuiltInObjectTags.empty,
        objectType: BuiltInObjectType.empty,
    },
];

const $builtinClassPropsMap = new Map<string, RuntimeDataClassProps>();
for (const props of $builtinClassProps) {
    $builtinClassPropsMap.set(props.name, props);
}

class BuiltinDataClassPropsStatic {
    static resolve(name: string): $Undefinable<RuntimeDataClassProps> {
        return $builtinClassPropsMap.get(name);
    }
}

const BuiltinDataClassProps = BuiltinDataClassPropsStatic as StaticClass<typeof BuiltinDataClassPropsStatic>;
export default BuiltinDataClassProps;
