import type { $Undefinable, DataContract } from "../TypeHelpers";
import { dataClass, dataField, FieldType, ObjectType } from "../annotations/DataModelAnnotations";
import { objectTag } from "../annotations/ObjectTagRegistry";
import WellKnownObjectTags from "./WellKnownObjectTags";
import { CurveInfinityHandleMode, EaseType, RotationOrder, TangentMode, WeightedMode } from "./ModelEnums";
import { namespaceTag } from "../annotations/NamespaceTagRegistry";

/***  Utility data classes  ***/

@dataClass()
export class CCurvePointV3 {
    @dataField({ type: FieldType.string })
    static serializedVersion: string = undefined!;
    @dataField({ type: FieldType.float })
    static time: number = undefined!;
    @dataField({ type: FieldType.float })
    static value: number = undefined!;
    @dataField({ type: FieldType.float })
    static inSlope: number = undefined!;
    @dataField({ type: FieldType.float })
    static outSlope: number = undefined!;
    @dataField({ type: FieldType.enum })
    static tangentMode: TangentMode = undefined!;
    @dataField({ type: FieldType.enum })
    static weightedMode: WeightedMode = undefined!;
    @dataField({ type: FieldType.float })
    static inWeight: number = undefined!;
    @dataField({ type: FieldType.float })
    static outWeight: number = undefined!;
}

@dataClass()
export class CCurveV2 {
    @dataField({ type: FieldType.string })
    static serializedVersion: string = undefined!;
    @dataField({
        name: "m_Curve",
        type: FieldType.array,
        typeRef: CCurvePointV3,
        itemsObjectTypeHint: ObjectType.nested,
    })
    static curve: DataContract<typeof CCurvePointV3>[] = undefined!;
    @dataField({ name: "m_PreInfinity", type: FieldType.enum })
    static preInfinity: CurveInfinityHandleMode = undefined!;
    @dataField({ name: "m_PostInfinity", type: FieldType.enum })
    static postInfinity: CurveInfinityHandleMode = undefined!;
    @dataField({ name: "m_RotationOrder", type: FieldType.enum })
    static rotationOrder: RotationOrder = undefined!;
}

@namespaceTag("AnimationCurve")
@dataClass()
export class CAnimationCurve {
    @dataField({ name: "_curve", type: FieldType.nestedObject, typeRef: CCurveV2 })
    static curve: DataContract<typeof CCurveV2> = undefined!;
}

@dataClass()
export class CClip {
    @dataField({ name: "_startTime", type: FieldType.float })
    static startTime: number = undefined!;
    @dataField({ name: "_duration", type: FieldType.float })
    static duration: number = undefined!;
    @dataField({ name: "_clipIn", type: FieldType.float, optional: true })
    static clipIn: $Undefinable<number> = undefined!;
    @dataField({ name: "_easeInDuration", type: FieldType.float })
    static easeInDuration: number = undefined!;
    @dataField({ name: "_easeOutDuration", type: FieldType.float })
    static easeOutDuration: number = undefined!;
    @dataField({ name: "_blendInDuration", type: FieldType.float })
    static blendInDuration: number = undefined!;
    @dataField({ name: "_blendOutDuration", type: FieldType.float })
    static blendOutDuration: number = undefined!;
    @dataField({ name: "_mixInEaseType", type: FieldType.enum })
    static mixInEaseType: EaseType = undefined!;
    @dataField({
        name: "_mixInCurve",
        type: FieldType.nestedObject,
        typeRef: CCurveV2,
        optional: true,
    })
    static mixInCurve: $Undefinable<DataContract<typeof CCurveV2>> = undefined!;
    @dataField({ name: "_mixOutEaseType", type: FieldType.enum })
    static mixOutEaseType: EaseType = undefined!;
    @dataField({
        name: "_mixOutCurve",
        type: FieldType.nestedObject,
        typeRef: CCurveV2,
        optional: true,
    })
    static mixOutCurve: $Undefinable<DataContract<typeof CCurveV2>> = undefined!;
    @dataField({ name: "_timeScale", type: FieldType.float })
    static timeScale: number = undefined!;
}

@dataClass()
export class CDecalSetting {
    @dataField({ type: FieldType.string })
    static path: string = undefined!;
    @dataField({ type: FieldType.string })
    static attribute: string = undefined!;
    @dataField({ type: FieldType.float })
    static value: number = undefined!;
}

@dataClass()
export class CShakeSetting {
    @dataField({ type: FieldType.float })
    static strength: number = undefined!;
    @dataField({ type: FieldType.float })
    static duration: number = undefined!;
    @dataField({ type: FieldType.float })
    static interval: number = undefined!;
    @dataField({ type: FieldType.integer })
    static count: number = undefined!;
    @dataField({ type: FieldType.enum })
    static ease: EaseType = undefined!;
}

@dataClass()
export class CFacialModel {
    @dataField({ type: FieldType.string })
    static path: string = undefined!;
    @dataField({ type: FieldType.integer })
    static index: number = undefined!;
    @dataField({ type: FieldType.float })
    static value: number = undefined!;
}

@dataClass()
export class CActorFacialOverrideSetting {
    @dataField({ type: FieldType.array, typeRef: CFacialModel, itemsObjectTypeHint: ObjectType.nested })
    static faceModels: DataContract<typeof CFacialModel>[] = undefined!;
    @dataField({ type: FieldType.array, typeRef: CDecalSetting, itemsObjectTypeHint: ObjectType.nested })
    static decals: DataContract<typeof CDecalSetting>[] = undefined!;
}

@dataClass()
export class CVector3 {
    @dataField({ type: FieldType.float })
    static x: number = undefined!;
    @dataField({ type: FieldType.float })
    static y: number = undefined!;
    @dataField({ type: FieldType.float })
    static z: number = undefined!;
}

@dataClass()
export class CTransform {
    @dataField({ type: FieldType.nestedObject, typeRef: CVector3 })
    static position: DataContract<typeof CVector3> = undefined!;
    @dataField({ type: FieldType.nestedObject, typeRef: CVector3 })
    static rotation: DataContract<typeof CVector3> = undefined!;
    @dataField({ type: FieldType.nestedObject, typeRef: CVector3 })
    static scale: DataContract<typeof CVector3> = undefined!;
}

@dataClass()
export class CDofSetting {
    @dataField({ type: FieldType.boolean })
    static active: boolean = undefined!;
    @dataField({ type: FieldType.float })
    static focalPoint: number = undefined!;
    @dataField({ type: FieldType.float })
    static fNumber: number = undefined!;
    @dataField({ type: FieldType.float })
    static maxBlurSpread: number = undefined!;
}

@dataClass()
export class CCameraSettingCore {
    @dataField({ type: FieldType.float })
    static focalLength: number = undefined!;
    @dataField({ type: FieldType.float })
    static nearClipPlane: number = undefined!;
    @dataField({ type: FieldType.float })
    static farClipPlane: number = undefined!;
    @dataField({ type: FieldType.nestedObject, typeRef: CTransform })
    static transform: DataContract<typeof CTransform> = undefined!;
    @dataField({ type: FieldType.nestedObject, typeRef: CDofSetting })
    static dofSetting: DataContract<typeof CDofSetting> = undefined!;
}

/***  Named classes  ***/

@objectTag(WellKnownObjectTags.Background)
@dataClass()
export class CBackground {
    @dataField({ type: FieldType.string })
    static id: string = undefined!;
    @dataField({ type: FieldType.string })
    static src: string = undefined!;
}

@objectTag(WellKnownObjectTags.BackgroundGroup)
@dataClass({ objectType: ObjectType.plain })
export class CBackgroundGroup {
    @dataField({ type: FieldType.array, typeRef: CBackground, itemsObjectTypeHint: ObjectType.plain })
    static backgrounds: DataContract<typeof CBackground>[] = undefined!;
}

@objectTag(WellKnownObjectTags.Crowd)
@dataClass()
export class CCrowd {
    @dataField({ type: FieldType.string })
    static id: string = undefined!;
    @dataField({ type: FieldType.string })
    static model: string = undefined!;
    @dataField({ type: FieldType.string })
    static layout: string = undefined!;
}

@objectTag(WellKnownObjectTags.CrowdGroup)
@dataClass({ objectType: ObjectType.plain })
export class CCrowdGroup {
    @dataField({ type: FieldType.array, typeRef: CCrowd, itemsObjectTypeHint: ObjectType.plain })
    static crowds: DataContract<typeof CCrowd>[] = undefined!;
}

@objectTag(WellKnownObjectTags.CrowdDisplay)
@dataClass({ objectType: ObjectType.plain })
export class CCrowdDisplay {
    @dataField({ type: FieldType.string })
    static id: string = undefined!;
    @dataField({ type: FieldType.nestedObject, typeRef: CClip })
    static clip: DataContract<typeof CClip> = undefined!;
}

@dataClass()
export class CCrowdMotionSettings {
    @dataField({ type: FieldType.float })
    static skipDuration: number = undefined!;
    @dataField({ type: FieldType.float })
    static maxDelay: number = undefined!;
    @dataField({ type: FieldType.integer })
    static delayRandomSeed: number = undefined!;
    @dataField({ type: FieldType.boolean })
    static hidePenlight: boolean = undefined!;
}

@objectTag(WellKnownObjectTags.CrowdMotion)
@dataClass({ objectType: ObjectType.plain })
export class CCrowdMotion {
    @dataField({ type: FieldType.string })
    static id: string = undefined!;
    @dataField({ type: FieldType.string })
    static motion: string = undefined!;
    @dataField({ type: FieldType.nestedObject, typeRef: CCrowdMotionSettings })
    static setting: DataContract<typeof CCrowdMotionSettings> = undefined!;
    @dataField({ type: FieldType.nestedObject, typeRef: CClip })
    static clip: DataContract<typeof CClip> = undefined!;
}

// The same as CCrowdMotion, except for the tag
@objectTag(WellKnownObjectTags.CrowdOverrideMotion)
@dataClass({ objectType: ObjectType.plain })
export class CCrowdOverrideMotion {
    @dataField({ type: FieldType.string })
    static id: string = undefined!;
    @dataField({ type: FieldType.string })
    static motion: string = undefined!;
    @dataField({ type: FieldType.nestedObject, typeRef: CCrowdMotionSettings })
    static setting: DataContract<typeof CCrowdMotionSettings> = undefined!;
    @dataField({ type: FieldType.nestedObject, typeRef: CClip })
    static clip: DataContract<typeof CClip> = undefined!;
}

@objectTag(WellKnownObjectTags.Actor)
@dataClass()
export class CActor {
    @dataField({ type: FieldType.string })
    static id: string = undefined!;
    @dataField({ type: FieldType.string })
    static body: string = undefined!;
    @dataField({ type: FieldType.string })
    static face: string = undefined!;
    @dataField({ type: FieldType.string })
    static hair: string = undefined!;
}

@objectTag(WellKnownObjectTags.ActorGroup)
@dataClass({ objectType: ObjectType.plain })
export class CActorGroup {
    @dataField({ type: FieldType.array, typeRef: CActor, itemsObjectTypeHint: ObjectType.plain })
    static actors: DataContract<typeof CActor>[] = undefined!;
}

@objectTag(WellKnownObjectTags.ActorLayout)
@dataClass()
export class CActorLayout {
    @dataField({ type: FieldType.string })
    static id: string = undefined!;
    @dataField({ type: FieldType.nestedObject, typeRef: CTransform })
    static transform: DataContract<typeof CTransform> = undefined!;
}

@objectTag(WellKnownObjectTags.ActorLayoutGroup)
@dataClass({ objectType: ObjectType.plain })
export class CActorLayoutGroup {
    @dataField({ type: FieldType.array, typeRef: CActorLayout, itemsObjectTypeHint: ObjectType.plain })
    static layouts: DataContract<typeof CActorLayout>[] = undefined!;
    @dataField({ type: FieldType.nestedObject, typeRef: CClip })
    static clip: DataContract<typeof CClip> = undefined!;
}

@objectTag(WellKnownObjectTags.ActorLighting)
@dataClass({ objectType: ObjectType.plain })
export class CActorLighting {
    @dataField({ type: FieldType.nestedObject, typeRef: CClip })
    static clip: DataContract<typeof CClip> = undefined!;
}

@objectTag(WellKnownObjectTags.ActorColorTween)
@dataClass({ objectType: ObjectType.plain })
export class CActorColorTween {
    @dataField({ type: FieldType.string })
    static id: string = undefined!;
    @dataField({ type: FieldType.string, optional: true })
    static fromColor: $Undefinable<string> = undefined!;
    @dataField({ type: FieldType.nestedObject, typeRef: CClip })
    static clip: DataContract<typeof CClip> = undefined!;
}

@objectTag(WellKnownObjectTags.ActorMotion)
@dataClass({ objectType: ObjectType.plain })
export class CActorMotion {
    @dataField({ type: FieldType.string })
    static id: string = undefined!;
    @dataField({ type: FieldType.string })
    static motion: string = undefined!;
    @dataField({ type: FieldType.float, optional: true, writeOptions: { trimFloatNumbers: true } })
    static transition: $Undefinable<number> = undefined!;
    @dataField({ type: FieldType.nestedObject, typeRef: CClip })
    static clip: DataContract<typeof CClip> = undefined!;
}

// The same as CActorMotion, except for the tag
@objectTag(WellKnownObjectTags.ActorAdditiveMotion)
@dataClass({ objectType: ObjectType.plain })
export class CActorAdditiveMotion {
    @dataField({ type: FieldType.string })
    static id: string = undefined!;
    @dataField({ type: FieldType.string })
    static motion: string = undefined!;
    @dataField({ type: FieldType.nestedObject, typeRef: CClip })
    static clip: DataContract<typeof CClip> = undefined!;
}

@objectTag(WellKnownObjectTags.ActorFacialMotion)
@dataClass({ objectType: ObjectType.plain })
export class CActorFacialMotion {
    @dataField({ type: FieldType.string })
    static id: string = undefined!;
    @dataField({ type: FieldType.string })
    static motion: string = undefined!;
    @dataField({ type: FieldType.float, optional: true, writeOptions: { trimFloatNumbers: true } })
    static transition: $Undefinable<number> = undefined!;
    @dataField({ type: FieldType.nestedObject, typeRef: CClip })
    static clip: DataContract<typeof CClip> = undefined!;
}

@objectTag(WellKnownObjectTags.ActorFacialOverrideMotion)
@dataClass({ objectType: ObjectType.plain })
export class CActorFacialOverrideMotion {
    @dataField({ type: FieldType.string })
    static id: string = undefined!;
    @dataField({ type: FieldType.nestedObject, typeRef: CActorFacialOverrideSetting })
    static setting: DataContract<typeof CActorFacialOverrideSetting> = undefined!;
    @dataField({ type: FieldType.nestedObject, typeRef: CClip })
    static clip: DataContract<typeof CClip> = undefined!;
}

// TODO...

@objectTag(WellKnownObjectTags.Message)
@dataClass({ objectType: ObjectType.plain })
export class CMessage {
    @dataField({ type: FieldType.string })
    static text: string = undefined!;
    @dataField({ name: "name", type: FieldType.string })
    static speaker: string = undefined!; // rename to avoid collision with Function.name
    @dataField({ type: FieldType.boolean, optional: true })
    static hide: $Undefinable<boolean> = undefined!;
    @dataField({ type: FieldType.nestedObject, typeRef: CClip })
    static clip: DataContract<typeof CClip> = undefined!;
}

@objectTag(WellKnownObjectTags.Fade)
@dataClass({ objectType: ObjectType.plain })
export class CFade {
    @dataField({ type: FieldType.float, writeOptions: { trimFloatNumbers: true }, optional: true })
    static from: $Undefinable<number> = undefined!;
    @dataField({ type: FieldType.float, writeOptions: { trimFloatNumbers: true }, optional: true })
    static to: $Undefinable<number> = undefined!;
    @dataField({ type: FieldType.nestedObject, typeRef: CClip })
    static clip: DataContract<typeof CClip> = undefined!;
}

@objectTag(WellKnownObjectTags.Voice)
@dataClass({ objectType: ObjectType.plain })
export class CVoice {
    @dataField({ type: FieldType.string })
    static voice: string = undefined!;
    @dataField({ type: FieldType.string })
    static actorId: string = undefined!;
    @dataField({ type: FieldType.integer })
    static channel: number = undefined!;
    @dataField({ type: FieldType.nestedObject, typeRef: CClip })
    static clip: DataContract<typeof CClip> = undefined!;
}

@objectTag(WellKnownObjectTags.CameraSetting)
@dataClass({ objectType: ObjectType.plain })
export class CCameraSetting {
    @dataField({ type: FieldType.nestedObject, typeRef: CCameraSettingCore })
    static setting: DataContract<typeof CCameraSettingCore> = undefined!;
    @dataField({ type: FieldType.nestedObject, typeRef: CClip })
    static clip: DataContract<typeof CClip> = undefined!;
}

@objectTag(WellKnownObjectTags.SE)
@dataClass({ objectType: ObjectType.plain })
export class CSe {
    @dataField({ type: FieldType.string })
    static se: string = undefined!;
    @dataField({ type: FieldType.nestedObject, typeRef: CClip })
    static clip: DataContract<typeof CClip> = undefined!;
}

@objectTag(WellKnownObjectTags.BgmPlay)
@dataClass({ objectType: ObjectType.plain })
export class CBgmPlay {
    @dataField({ type: FieldType.string })
    static bgm: string = undefined!;
    @dataField({ type: FieldType.nestedObject, typeRef: CClip })
    static clip: DataContract<typeof CClip> = undefined!;
}

@objectTag(WellKnownObjectTags.BgmStop)
@dataClass({ objectType: ObjectType.plain })
export class CBgmStop {
    @dataField({ type: FieldType.float, writeOptions: { trimFloatNumbers: true } })
    static fadeTime: number = undefined!;
    @dataField({ type: FieldType.nestedObject, typeRef: CClip })
    static clip: DataContract<typeof CClip> = undefined!;
}

@objectTag(WellKnownObjectTags.Shake)
@dataClass({ objectType: ObjectType.plain })
export class CShake {
    @dataField({ type: FieldType.nestedObject, typeRef: CShakeSetting, optional: true })
    static setting: $Undefinable<DataContract<typeof CShakeSetting>> = undefined!;
    @dataField({ type: FieldType.nestedObject, typeRef: CClip })
    static clip: DataContract<typeof CClip> = undefined!;
}

@objectTag(WellKnownObjectTags.Timeline)
@dataClass({ objectType: ObjectType.plain })
export class CTimeline {
    // Fields unknown
}
