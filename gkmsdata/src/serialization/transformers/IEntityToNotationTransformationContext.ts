import ObjectScopeKind from "./ObjectScopeKind";

export default interface IEntityToNotationTransformationContext {
    pushObjectScope(kind: ObjectScopeKind): void;

    popObjectScope(): boolean;

    getCurrentObjectScope(): ObjectScopeKind;
}
