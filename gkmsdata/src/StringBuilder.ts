import { $Nullable, $Undefinable } from "./TypeHelpers";

interface Formattable {
    toString(): string;
}

function stringify(value: $Undefinable<$Nullable<string | number | boolean | Formattable>>): string {
    let result: string;

    if (typeof value === "string") {
        result = value;
    } else if (typeof value === "boolean") {
        result = value ? "true" : "false";
    } else if (typeof value === "undefined") {
        result = "undefined";
    } else if (value === null) {
        result = "null";
    } else {
        result = value.toString();
    }

    return result;
}

function formatString(format: string, ...args: readonly Formattable[]): string {
    return format.replace(/{(\d+)}/g, (match, number) => {
        return typeof args[number] !== "undefined" ? stringify(args[number]) : match;
    });
}

export default class StringBuilder {
    newLine: string = "\n";

    clear(): void {
        this._resultCache = null;
        this._s.length = 0;
    }

    append(value: $Undefinable<$Nullable<string | number | boolean | Formattable>>): this {
        this._resultCache = null;
        const v = stringify(value);
        this._s.push(v);
        return this;
    }

    appendFormat(format: string, ...args: readonly Formattable[]): this {
        this._resultCache = null;
        if (args.length === 0) {
            return this.append(format);
        } else {
            const value = formatString(format, ...args);
            return this.append(value);
        }
    }

    appendLine(value?: $Undefinable<$Nullable<string | number | boolean | Formattable>>): this {
        this._resultCache = null;
        if (arguments.length > 0) {
            this.append(value);
        }
        this._s.push(this.newLine);
        return this;
    }

    appendLineFormat(format: string, ...args: readonly Formattable[]): this {
        this._resultCache = null;
        this.appendFormat(format, ...args);
        this.appendLine();
        return this;
    }

    getString(): string {
        if (this._resultCache === null) {
            this._resultCache = this._s.join("");
        }

        return this._resultCache;
    }

    private readonly _s: string[] = [];
    private _resultCache: $Nullable<string> = null;
}
