import * as assert from "assert";
import * as peggy from "peggy";
import * as fs from "fs";
import * as path from "path";

describe("Parser Gen", function () {
    const parserFilePath = path.join(__dirname, "../resources/gkms_scenario.pegjs");
    const parserFileText = fs.readFileSync(parserFilePath, { encoding: "utf8" });

    const parser = peggy.generate([
        {
            source: "gkms_scenario.pegjs",
            text: parserFileText,
        },
    ]);

    function testParserAgainstFile(parser: peggy.Parser, filePath: string): void {
        const startRule = "Start";

        const options: peggy.ParserOptions = {
            startRule,
        };

        const testInput = fs.readFileSync(filePath, { encoding: "utf8" });
        const lines = testInput.split("\n");

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            let success = false;

            try {
                void parser.parse(line, options);
                success = true;
            } catch (e) {
                // success = false;
                //
                // const err = e as peggy.GrammarError;
                // for (const [severity, message, location, notes] of err.problems) {
                //     console.error(`[${severity}] ${message} (${location})`);
                //
                //     if (notes) {
                //         for (const note of notes) {
                //             console.info(`Note: ${note.message} (${note.location}`);
                //         }
                //     }
                // }
                console.error(e);
            }
            assert.ok(success, `match failed: line ${i + 1} @ ${filePath}`);
        }
    }

    it("parses correct input file 1", function () {
        testParserAgainstFile(parser, path.join(__dirname, "../resources/test_data/adv_live_amao_001_end-01-01.txt"));
    });

    it("parses correct input file 2", function () {
        testParserAgainstFile(parser, path.join(__dirname, "../resources/test_data/adv_csprt-2-0000_01.txt"));
    });
});
