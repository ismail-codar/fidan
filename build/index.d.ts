export interface FidanValue<T> {
    (val?: T): T;
    readonly $val: T;
}
export declare type FidanArrayEventType = "itemadded" | "itemset" | "itemremoved" | "beforemulti" | "aftermulti";
export interface EventedArrayReturnType<T> extends Array<T> {
    on: (type: any, callback: any) => void;
    off: any;
    innerArray: T[];
    setEventsFrom: (val: EventedArrayReturnType<T>) => void;
}
export interface FidanArray<T> {
    (val?: T[]): T[] & EventedArrayReturnType<T>;
    readonly $val: T[] & EventedArrayReturnType<T>;
}
import * as fidanObj from "./index-libs";
export declare const fidan: typeof fidanObj;
