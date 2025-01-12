import * as assert from "assert";
import GkmsScenarioParserUtils from "../src/serialization/parser/GkmsScenarioParserUtils";
import TransformerFactory from "../src/serialization/TransformerFactory";
import DataModelHelper from "../src/model/DataModelHelper";
import type { ActorGroup, CrowdDisplay, Message } from "../src/model/DataModels";
import WellKnownObjectTags from "../src/model/WellKnownObjectTags";
import ScenarioLineSerializer from "../src/serialization/ScenarioLineSerializer";

describe("Notation to Entity", function () {
    const allDataModels = DataModelHelper.getAllDataModels();
    const transformer = TransformerFactory.notationToEntity(allDataModels);

    it("should deserialize the 1st line", function () {
        const line =
            "[crowdgroup crowds=[crowd id=crowd_start-01-01 model=crw_mdl_mix-high_none_00 layout=crw_layout_env_3d_live_courtyard-00-00-noon]]";
        const parsed = GkmsScenarioParserUtils.parseLine(line);

        const entity = transformer.transform(parsed, WellKnownObjectTags.CrowdGroup);

        assert.strictEqual(entity.crowds[0].model, "crw_mdl_mix-high_none_00");
    });

    it("should handle field renaming during deserialization", function () {
        const line =
            '[crowddisplay id=crowd_start-01-01 clip=\\{"_startTime":0.0,"_duration":9.1666666667,"_clipIn":0.0,"_easeInDuration":0.0,"_easeOutDuration":0.0,"_blendInDuration":-1.0,"_blendOutDuration":-1.0,"_mixInEaseType":1,"_mixInCurve":\\{"serializedVersion":"2","m_Curve":[],"m_PreInfinity":2,"m_PostInfinity":2,"m_RotationOrder":4\\},"_mixOutEaseType":1,"_mixOutCurve":\\{"serializedVersion":"2","m_Curve":[],"m_PreInfinity":2,"m_PostInfinity":2,"m_RotationOrder":4\\},"_timeScale":1.0\\}]';
        const parsed = GkmsScenarioParserUtils.parseLine(line);

        const entity = transformer.transformAs<CrowdDisplay>(parsed);

        assert.strictEqual(entity.clip.duration, 9.1666666667);
        assert.strictEqual(entity.clip.easeInDuration, 0);
    });

    it("should deserialize plain object's array property (multiple items)", function () {
        const line =
            "[actorgroup actors=[actor id=hski body=mdl_chr_hski-schl-0000_body face=mdl_chr_hski-base-0000_face hair=mdl_chr_hski-base-0000_hair] actors=[actor id=hume body=mdl_chr_hume-schl-0000_body face=mdl_chr_hume-base-0000_face hair=mdl_chr_hume-base-0000_hair]]";
        const parsed = GkmsScenarioParserUtils.parseLine(line);

        const entity = transformer.transformAs<ActorGroup>(parsed);
        assert.strictEqual(entity.actors.length, 2);

        assert.strictEqual(entity.actors[0].body, "mdl_chr_hski-schl-0000_body");
        assert.strictEqual(entity.actors[1].body, "mdl_chr_hume-schl-0000_body");
    });

    it("should deserialize plain object's array property (one item)", function () {
        const line =
            "[actorgroup actors=[actor id=hume body=mdl_chr_hume-schl-0000_body face=mdl_chr_hume-base-0000_face hair=mdl_chr_hume-base-0000_hair]]";
        const parsed = GkmsScenarioParserUtils.parseLine(line);

        const entity = transformer.transformAs<ActorGroup>(parsed);
        assert.strictEqual(entity.actors.length, 1);

        assert.strictEqual(entity.actors[0].body, "mdl_chr_hume-schl-0000_body");
    });

    it("should deserialize plain object's array property (no item)", function () {
        const line = "[actorgroup]";
        const parsed = GkmsScenarioParserUtils.parseLine(line);

        const entity = transformer.transformAs<ActorGroup>(parsed);
        assert.ok(entity.actors);
        assert.strictEqual(entity.actors.length, 0);
    });

    it("should unescape literal strings (string values in plain objects)", function () {
        // \u00a0: NBSP
        const line =
            '[message text=こっ……こらぁ～っ！\u00a0\\n佑芽！\u00a0あんたねえ！ name=咲季 clip=\\{"_startTime":6.6108635906,"_duration":6.4463337784,"_clipIn":0.0,"_easeInDuration":0.0,"_easeOutDuration":0.0,"_blendInDuration":-1.0,"_blendOutDuration":-1.0,"_mixInEaseType":1,"_mixInCurve":\\{"serializedVersion":"2","m_Curve":[],"m_PreInfinity":2,"m_PostInfinity":2,"m_RotationOrder":4\\},"_mixOutEaseType":1,"_mixOutCurve":\\{"serializedVersion":"2","m_Curve":[],"m_PreInfinity":2,"m_PostInfinity":2,"m_RotationOrder":4\\},"_timeScale":1.0\\}]';
        const entity = ScenarioLineSerializer.deserialize<Message>(line, WellKnownObjectTags.Message);

        assert.strictEqual(entity.object.text, "こっ……こらぁ～っ！ \n佑芽！ あんたねえ！");
        assert.strictEqual(entity.object.clip.mixInCurve?.curve.length, 0);
    });

    // TODO: nullable object test ("voice" tag)
    // TODO: undefinable number test ("actorfacialmotion" tag)
});
