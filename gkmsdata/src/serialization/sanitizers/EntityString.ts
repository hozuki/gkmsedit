import jsesc from "jsesc";
import { StaticClass } from "../../TypeHelpers";

const SPACE_REGEX = / /g;
const NBSP = "\u00a0";

class EntityStringStatic {
    static checkQuoted(string: string): boolean {
        return true;
    }

    static escapeQuoted(string: string): string;
    static escapeQuoted<T>(value: T): T;
    static escapeQuoted(value: unknown): unknown {
        if (typeof value === "string") {
            return jsesc(value, {
                minimal: true,
                quotes: "double",
            });
        } else {
            return value;
        }
    }

    static checkLiteral(string: string): boolean {
        if (string.includes("=")) {
            return false;
        }

        return true;
    }

    static escapeLiteral(string: string): string;
    static escapeLiteral<T>(value: T): T;
    static escapeLiteral(value: unknown): unknown {
        if (typeof value === "string") {
            let val = value.replace(SPACE_REGEX, NBSP);
            val = val.replace(/\\/g, "\\\\");
            val = val.replace(/\n/g, "\\n");
            return val;
        } else {
            return value;
        }
    }
}

const EntityString = EntityStringStatic as StaticClass<typeof EntityStringStatic>;
export default EntityString;
