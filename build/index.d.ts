export interface FidanValue<T> {
    (val?: T): T;
    $val: T;
    debugName: (name: string) => FidanValue<T>;
    depends: (...args: any[]) => FidanValue<T>;
}
export declare type FidanArrayEventType = "itemadded" | "itemset" | "itemremoved" | "beforemulti" | "aftermulti";
export interface EventedArrayReturnType<T> extends Array<T> {
    on: (type: FidanArrayEventType, callback: any) => void;
    off: any;
    innerArray: T[];
    setEventsFrom: (val: EventedArrayReturnType<T>) => void;
}
export interface FidanArray<T> {
    (val?: T[]): T[] & EventedArrayReturnType<T>;
    readonly $val: T[] & EventedArrayReturnType<T>;
    size?: FidanValue<number>;
}
export declare type FidanData<T> = FidanValue<T> | FidanArray<T>;
import * as fidanObj from "./index-libs";
export declare const fidan: typeof fidanObj;
