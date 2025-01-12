import TransformerFactory from "./TransformerFactory";
import DataModelHelper from "../model/DataModelHelper";
import GkmsScenarioParserUtils from "./parser/GkmsScenarioParserUtils";
import StringBuilder from "../StringBuilder";
import NotationWriter from "./writer/NotationWriter";
import type EntityWithObjectTag from "./EntityWithObjectTag";
import { StaticClass } from "../TypeHelpers";

const $allDataModels = DataModelHelper.getAllDataModels();
const $n2e = TransformerFactory.notationToEntity($allDataModels);
const $e2n = TransformerFactory.entityToNotation($allDataModels);

class ScenarioLineSerializerStatic {
    static deserialize<T extends object = object>(line: string, tagCheck?: string): EntityWithObjectTag<T> {
        const parsed = GkmsScenarioParserUtils.parseLine(line);

        const objectTag = parsed.value?.objectTag;
        if (!objectTag) {
            throw new TypeError("parsed object is not a valid plain object");
        }

        if (typeof tagCheck !== "undefined") {
            if (tagCheck !== objectTag) {
                throw new TypeError(`tags mismatch: expected '${tagCheck}', found '${objectTag}'`);
            }
        }

        const object = $n2e.transformAs<T>(parsed);
        if (typeof object === "undefined") {
            throw new TypeError("cannot deserialize object");
        }

        return { objectTag, object };
    }

    static serialize<T extends object = object>(e: EntityWithObjectTag<T>): string {
        const { object, objectTag } = e;

        const notation = $e2n.transform(object as Record<PropertyKey, unknown>, objectTag);
        if (typeof notation === "undefined") {
            throw new TypeError("cannot serialize object");
        }

        const stringBuilder = new StringBuilder();

        NotationWriter.writeTo(notation, stringBuilder);

        return stringBuilder.getString();
    }
}

const ScnearioLineSerializer = ScenarioLineSerializerStatic as StaticClass<typeof ScenarioLineSerializerStatic>;
export default ScnearioLineSerializer;
