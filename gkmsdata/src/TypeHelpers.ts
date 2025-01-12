export type $Nullable<T> = T | null;
export type $Undefinable<T> = T | undefined;
// eslint-disable-next-line @typescript-eslint/ban-types
export type StaticClass<T> = Omit<T, keyof Function>;
// eslint-disable-next-line @typescript-eslint/ban-types
export type StaticObject<T> = Omit<T, keyof Object>;

type Primitive = number | string | boolean | symbol | bigint;
type DataContractFieldType =
    | $Nullable<$Undefinable<Primitive>>
    | { [K: PropertyKey]: DataContractFieldType }
    | DataContractFieldType[];

type ValuesOf<T> = T extends { [_ in keyof T]: infer U } ? U : never;
type MappedValuesAsKeys<T> = { [K in keyof T]: T[K] extends DataContractFieldType ? K : never };
type RemoveNonDataContractFields<T> = { [K in keyof T as K extends ValuesOf<MappedValuesAsKeys<T>> ? K : never]: T[K] };

// Inspired by:
// https://stackoverflow.com/a/61580077
// https://stackoverflow.com/a/51955852
export type DataContract<T> = RemoveNonDataContractFields<T>;
