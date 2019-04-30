export interface FidanValue<T> {
    (val?: T): T;
    $val: T;
    debugName: (name: string) => FidanValue<T>;
    depends: (dependencies: () => FidanValue<any>[]) => FidanValue<T>;
    size: FidanValue<number>;
}
export declare type FidanArrayEventType = "itemadded" | "itemset" | "itemremoved" | "beforemulti" | "aftermulti";
export interface EventedArrayReturnType<T> extends Array<T> {
    on: (type: FidanArrayEventType, callback: any) => void;
    off: any;
    setEventsFrom: (val: EventedArrayReturnType<T>) => void;
}
export * from "./f";
export * from "./dom";
export * from "./util";
export * from "./html";
