export interface DataArrayEvents<T> {
    onAdd?: (args: T[]) => void;
    onRemove?: (args: T[]) => void;
    onUpdate?: (args: T[]) => void;
}
export declare type ComputionMethodArguments<T> = T extends Array<any> ? {
    computedItem: FidanValue<T>;
    method: string;
    args: any[];
} : {
    computedItem: FidanValue<any>;
};
export interface FidanValue<T> {
    (val?: T, opt?: ComputionMethodArguments<T>): T;
    $val: T;
    debugName: (name: string) => FidanValue<T>;
    depends: (deps: (FidanValue<any> | (() => any))[]) => FidanValue<T>;
}
export interface FidanArray<T extends Array<any>> extends FidanValue<T> {
    size: FidanValue<number>;
}
export * from "./f";
export * from "./dom";
export * from "./util";
export * from "./html";
