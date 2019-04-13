export interface FidanValue<T> {
    (val: T): void;
    readonly $val: T;
    freezed: boolean;
}
export declare type FidanArrayEventType = "itemadded" | "itemset" | "itemremoved";
export declare const value: <T>(val?: T, freezed?: boolean) => FidanValue<T>;
export declare const array: <T>(items: T[]) => {
    on?: (type: FidanArrayEventType, callback: (e: {
        item: T;
        index: number;
    }) => void) => void;
    removeEventListener?: (type: FidanArrayEventType) => void;
    $val: T[];
} & FidanValue<T[]>;
export declare const on: (arr: any[], type: FidanArrayEventType, callback: (e: {
    item: any;
    index: number;
}) => void) => void;
export declare const off: (arr: any[], type: FidanArrayEventType, callback: (e: {
    item: any;
    index: number;
}) => void) => void;
export declare const computeBy: <T>(initial: FidanValue<T>, fn: (current: any, prev?: any) => void, ...args: any[]) => FidanValue<{}>;
export declare const compute: <T>(fn: () => void, ...args: any[]) => void;
export declare const destroy: (item: any) => void;
