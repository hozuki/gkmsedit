import WellKnownObjectTags from "./WellKnownObjectTags";
import type {
    ActorAdditiveMotion,
    ActorColorTween,
    ActorFacialMotion,
    ActorFacialOverrideMotion,
    ActorGroup,
    ActorLayoutGroup,
    ActorMotion,
    BackgroundGroup,
    BgmPlay,
    BgmStop,
    CameraSetting,
    CrowdDisplay,
    CrowdGroup,
    Se,
    Shake,
    Voice,
} from "./DataModels";

export default interface WellKnownObjectTagToDataModelObject extends Record<WellKnownObjectTags, object> {
    [WellKnownObjectTags.BackgroundGroup]: BackgroundGroup;
    [WellKnownObjectTags.CrowdGroup]: CrowdGroup;
    [WellKnownObjectTags.CrowdDisplay]: CrowdDisplay;
    [WellKnownObjectTags.ActorGroup]: ActorGroup;
    [WellKnownObjectTags.ActorLayoutGroup]: ActorLayoutGroup;
    [WellKnownObjectTags.ActorMotion]: ActorMotion;
    [WellKnownObjectTags.ActorAdditiveMotion]: ActorAdditiveMotion;
    [WellKnownObjectTags.ActorFacialMotion]: ActorFacialMotion;
    [WellKnownObjectTags.ActorFacialOverrideMotion]: ActorFacialOverrideMotion;
    [WellKnownObjectTags.ActorColorTween]: ActorColorTween;
    [WellKnownObjectTags.Voice]: Voice;
    [WellKnownObjectTags.CameraSetting]: CameraSetting;
    [WellKnownObjectTags.SE]: Se;
    [WellKnownObjectTags.BgmPlay]: BgmPlay;
    [WellKnownObjectTags.BgmStop]: BgmStop;
    [WellKnownObjectTags.Shake]: Shake;
}
