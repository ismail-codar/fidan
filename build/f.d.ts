export interface FidanValue<T> {
    (val?: T): T;
    readonly $val: T;
    readonly $next: T;
    freezed: boolean;
}
export declare type FidanArrayEventType = "itemadded" | "itemset" | "itemremoved" | "beforemulti" | "aftermulti";
export interface EventedArrayReturnType<T> {
    on: any;
    off: any;
    innerArray: T[];
    setEventsFrom: (val: EventedArrayReturnType<T>) => void;
}
export interface FidanArray<T> {
    (val?: T[]): T[] & EventedArrayReturnType<T>;
    readonly $val: T[] & EventedArrayReturnType<T>;
    readonly $next: T[] & EventedArrayReturnType<T>;
    freezed: boolean;
}
export declare const array: <T>(items: T[]) => FidanArray<T>;
export declare const on: (arr: any[], type: FidanArrayEventType, callback: (e: {
    item: any;
    index: number;
}) => void) => void;
export declare const off: (arr: any[], type: FidanArrayEventType, callback: (e: {
    item: any;
    index: number;
}) => void) => void;
export declare const value: <T>(val?: T, freezed?: boolean) => FidanValue<T>;
export declare const computeBy: <T>(initial: FidanValue<T>, fn: (val?: T, changedItem?: any) => void, ...args: any[]) => FidanValue<any>;
export declare const beforeComputeBy: <T>(initial: FidanValue<T>, fn: (nextValue?: any, prevValue?: any, changedItem?: any) => void, ...args: any[]) => FidanValue<any>;
export declare const compute: <T>(fn: (val: T, changedItem?: any) => void, ...args: any[]) => FidanValue<any>;
export declare const beforeCompute: <T>(fn: (nextValue?: T, prevValue?: T, changedItem?: any) => void, ...args: any[]) => FidanValue<any>;
export declare const destroy: (item: any) => void;
