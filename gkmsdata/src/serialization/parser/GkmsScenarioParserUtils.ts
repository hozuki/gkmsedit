import * as gkms_parser from "./GkmsScenarioParser";
import type { PlainObjectValue } from "./GkmsScenarioParserModels";
import type { StaticClass } from "../../TypeHelpers";

class GkmsScenarioParserUtilsStatic {
    static parseLine(line: string): PlainObjectValue {
        return gkms_parser.parse(line) as PlainObjectValue;
    }
}

const GkmsScenarioParserUtils = GkmsScenarioParserUtilsStatic as StaticClass<typeof GkmsScenarioParserUtilsStatic>;
export default GkmsScenarioParserUtils;
