export default interface EntityWithObjectTag<T extends object = object> {
    object: T;
    objectTag: string;
}
