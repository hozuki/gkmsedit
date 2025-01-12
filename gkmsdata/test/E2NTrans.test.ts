import * as assert from "assert";
import TransformerFactory from "../src/serialization/TransformerFactory";
import DataModelHelper from "../src/model/DataModelHelper";
import type { ActorGroup, CrowdDisplay, CrowdGroup, Message } from "../src/model/DataModels";
import WellKnownObjectTags from "../src/model/WellKnownObjectTags";
import { ScenarioLineSerializer } from "../src";
import { CurveInfinityHandleMode, EaseType, RotationOrder } from "../src/model/ModelEnums";

describe("Entity to Notation", function () {
    const allDataModels = DataModelHelper.getAllDataModels();
    const transformer = TransformerFactory.entityToNotation(allDataModels);
    void transformer;

    it("should serialize the 1st line", function () {
        const entity: CrowdGroup = {
            crowds: [
                {
                    id: "crowd_start-01-01",
                    model: "crw_mdl_mix-high_none_00",
                    layout: "crw_layout_env_3d_live_courtyard-00-00-noon",
                },
            ],
        };

        const objTag = WellKnownObjectTags.CrowdGroup;

        const line = ScenarioLineSerializer.serialize({ object: entity, objectTag: objTag });
        const expectedLine =
            "[crowdgroup crowds=[crowd id=crowd_start-01-01 model=crw_mdl_mix-high_none_00 layout=crw_layout_env_3d_live_courtyard-00-00-noon]]";

        assert.strictEqual(line, expectedLine);
    });

    it("should handle field renaming during serialization", function () {
        const entity: CrowdDisplay = {
            id: "crowd_start-01-01",
            clip: {
                startTime: 0,
                duration: 9.1666666667,
                clipIn: 0,
                easeInDuration: 0,
                easeOutDuration: 0,
                blendInDuration: -1,
                blendOutDuration: -1,
                mixInEaseType: EaseType.unknown1,
                mixInCurve: {
                    serializedVersion: "2",
                    curve: [],
                    preInfinity: CurveInfinityHandleMode.unknown2,
                    postInfinity: CurveInfinityHandleMode.unknown2,
                    rotationOrder: RotationOrder.unknown4,
                },
                mixOutEaseType: EaseType.unknown1,
                mixOutCurve: {
                    serializedVersion: "2",
                    curve: [],
                    preInfinity: CurveInfinityHandleMode.unknown2,
                    postInfinity: CurveInfinityHandleMode.unknown2,
                    rotationOrder: RotationOrder.unknown4,
                },
                timeScale: 1,
            },
        };

        const objTag = WellKnownObjectTags.CrowdDisplay;

        const line = ScenarioLineSerializer.serialize({ object: entity, objectTag: objTag });
        const expectedLine =
            '[crowddisplay id=crowd_start-01-01 clip=\\{"_startTime":0.0,"_duration":9.1666666667,"_clipIn":0.0,"_easeInDuration":0.0,"_easeOutDuration":0.0,"_blendInDuration":-1.0,"_blendOutDuration":-1.0,"_mixInEaseType":1,"_mixInCurve":\\{"serializedVersion":"2","m_Curve":[],"m_PreInfinity":2,"m_PostInfinity":2,"m_RotationOrder":4\\},"_mixOutEaseType":1,"_mixOutCurve":\\{"serializedVersion":"2","m_Curve":[],"m_PreInfinity":2,"m_PostInfinity":2,"m_RotationOrder":4\\},"_timeScale":1.0\\}]';

        assert.strictEqual(line, expectedLine);
    });

    it("should serialize plain object's array property (multiple items)", function () {
        const entity: ActorGroup = {
            actors: [
                {
                    id: "hski",
                    body: "mdl_chr_hski-schl-0000_body",
                    face: "mdl_chr_hski-base-0000_face",
                    hair: "mdl_chr_hski-base-0000_hair",
                },
                {
                    id: "hume",
                    body: "mdl_chr_hume-schl-0000_body",
                    face: "mdl_chr_hume-base-0000_face",
                    hair: "mdl_chr_hume-base-0000_hair",
                },
            ],
        };

        const objTag = WellKnownObjectTags.ActorGroup;

        const line = ScenarioLineSerializer.serialize({ object: entity, objectTag: objTag });
        const expectedLine =
            "[actorgroup actors=[actor id=hski body=mdl_chr_hski-schl-0000_body face=mdl_chr_hski-base-0000_face hair=mdl_chr_hski-base-0000_hair] actors=[actor id=hume body=mdl_chr_hume-schl-0000_body face=mdl_chr_hume-base-0000_face hair=mdl_chr_hume-base-0000_hair]]";

        assert.strictEqual(line, expectedLine);
    });

    it("should serialize plain object's array property (single item)", function () {
        const entity: ActorGroup = {
            actors: [
                {
                    id: "hski",
                    body: "mdl_chr_hski-schl-0000_body",
                    face: "mdl_chr_hski-base-0000_face",
                    hair: "mdl_chr_hski-base-0000_hair",
                },
            ],
        };

        const objTag = WellKnownObjectTags.ActorGroup;

        const line = ScenarioLineSerializer.serialize({ object: entity, objectTag: objTag });
        const expectedLine =
            "[actorgroup actors=[actor id=hski body=mdl_chr_hski-schl-0000_body face=mdl_chr_hski-base-0000_face hair=mdl_chr_hski-base-0000_hair]]";

        assert.strictEqual(line, expectedLine);
    });

    it("should serialize plain object's array property (no item)", function () {
        const entity: ActorGroup = {
            actors: [],
        };

        const objTag = WellKnownObjectTags.ActorGroup;

        const line = ScenarioLineSerializer.serialize({ object: entity, objectTag: objTag });
        const expectedLine = "[actorgroup]";

        assert.strictEqual(line, expectedLine);
    });

    it("should escape literal strings (string values in plain objects)", function () {
        // \u00a0: NBSP
        const line =
            '[message text=こっ……こらぁ～っ！\u00a0\\n佑芽！\u00a0あんたねえ！ name=咲季 clip=\\{"_startTime":6.6108635906,"_duration":6.4463337784,"_clipIn":0.0,"_easeInDuration":0.0,"_easeOutDuration":0.0,"_blendInDuration":-1.0,"_blendOutDuration":-1.0,"_mixInEaseType":1,"_mixInCurve":\\{"serializedVersion":"2","m_Curve":[],"m_PreInfinity":2,"m_PostInfinity":2,"m_RotationOrder":4\\},"_mixOutEaseType":1,"_mixOutCurve":\\{"serializedVersion":"2","m_Curve":[],"m_PreInfinity":2,"m_PostInfinity":2,"m_RotationOrder":4\\},"_timeScale":1.0\\}]';
        const entity = ScenarioLineSerializer.deserialize<Message>(line, WellKnownObjectTags.Message);

        assert.strictEqual(entity.object.text, "こっ……こらぁ～っ！ \n佑芽！ あんたねえ！");
        assert.strictEqual(entity.object.clip.mixInCurve?.curve.length, 0);

        const serializedLine = ScenarioLineSerializer.serialize(entity);

        assert.strictEqual(serializedLine, line);
    });

    // TODO: nullable object test ("voice" tag)
    // TODO: undefinable number test ("actorfacialmotion" tag)
});
