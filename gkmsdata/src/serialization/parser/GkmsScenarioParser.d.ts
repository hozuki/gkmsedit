import * as peggy from "peggy";

export const StartRules: readonly string[];

export class SyntaxError extends Error {
    constructor(message: string, expected: unknown, found: unknown, location: peggy.Location);

    readonly name: 'SyntaxError';
    readonly expected: unknown;
    readonly found: unknown;
    readonly location: peggy.Location;

    format(sources: readonly peggy.SourceText[]): string;
    buildMessage(expected: unknown, found: unknown): string;
}

export function parse(input: string, options?: peggy.ParserOptions): unknown; // A PlainObject in our case
