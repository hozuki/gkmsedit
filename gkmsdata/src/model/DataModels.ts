import type { DataContract } from "../TypeHelpers";
import {
    CActor,
    CActorAdditiveMotion,
    CActorColorTween,
    CActorFacialMotion,
    CActorFacialOverrideMotion,
    CActorGroup,
    CActorLayout,
    CActorLayoutGroup,
    CActorLighting,
    CActorMotion,
    CAnimationCurve,
    CBackground,
    CBackgroundGroup,
    CBgmPlay,
    CBgmStop,
    CCameraSetting,
    CCameraSettingCore,
    CClip,
    CCrowd,
    CCrowdDisplay,
    CCrowdGroup,
    CCrowdMotion,
    CCrowdMotionSettings,
    CCrowdOverrideMotion,
    CCurvePointV3,
    CCurveV2,
    CDofSetting,
    CFade,
    CMessage,
    CSe,
    CShake,
    CTimeline,
    CTransform,
    CVector3,
    CVoice,
} from "./DataModelDefinitions";

export type CurvePointV3 = DataContract<typeof CCurvePointV3>;
export type CurveV2 = DataContract<typeof CCurveV2>;
export type AnimationCurve = DataContract<typeof CAnimationCurve>;
export type Clip = DataContract<typeof CClip>;
export type Vector3 = DataContract<typeof CVector3>;
export type Transform = DataContract<typeof CTransform>;
export type DofSetting = DataContract<typeof CDofSetting>;
export type CameraSettingCore = DataContract<typeof CCameraSettingCore>;

export type Background = DataContract<typeof CBackground>;
export type BackgroundGroup = DataContract<typeof CBackgroundGroup>;
export type Crowd = DataContract<typeof CCrowd>;
export type CrowdGroup = DataContract<typeof CCrowdGroup>;
export type CrowdDisplay = DataContract<typeof CCrowdDisplay>;
export type CrowdMotionSettings = DataContract<typeof CCrowdMotionSettings>;
export type CrowdMotion = DataContract<typeof CCrowdMotion>;
export type CrowdOverrideMotion = DataContract<typeof CCrowdOverrideMotion>;
export type Actor = DataContract<typeof CActor>;
export type ActorGroup = DataContract<typeof CActorGroup>;
export type ActorLayout = DataContract<typeof CActorLayout>;
export type ActorLayoutGroup = DataContract<typeof CActorLayoutGroup>;
export type ActorLighting = DataContract<typeof CActorLighting>;
export type ActorColorTween = DataContract<typeof CActorColorTween>;
export type ActorMotion = DataContract<typeof CActorMotion>;
export type ActorAdditiveMotion = DataContract<typeof CActorAdditiveMotion>;
export type ActorFacialMotion = DataContract<typeof CActorFacialMotion>;
export type ActorFacialOverrideMotion = DataContract<typeof CActorFacialOverrideMotion>;
// TODO...
export type Message = DataContract<typeof CMessage>;
export type Fade = DataContract<typeof CFade>;
export type Voice = DataContract<typeof CVoice>;
export type CameraSetting = DataContract<typeof CCameraSetting>;
export type Se = DataContract<typeof CSe>;
export type BgmPlay = DataContract<typeof CBgmPlay>;
export type BgmStop = DataContract<typeof CBgmStop>;
export type Shake = DataContract<typeof CShake>;
export type Timeline = DataContract<typeof CTimeline>;
