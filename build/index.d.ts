export interface ComputionMethodArguments<T> {
    computedItem: FidanValue<T>;
    method: string;
    args: any[];
}
export interface FidanValue<T> {
    (val?: T, opt?: ComputionMethodArguments<T>): T;
    $val: T;
    debugName: (name: string) => FidanValue<T>;
    depends: (dependencies: () => FidanValue<any>[]) => FidanValue<T>;
}
export interface FidanArray<T extends Array<any>> extends FidanValue<T> {
    size: FidanValue<number>;
}
export * from "./f";
export * from "./dom";
export * from "./util";
export * from "./html";
