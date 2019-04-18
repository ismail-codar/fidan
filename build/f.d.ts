import { FidanArray, FidanValue } from ".";
export declare const array: <T>(items: T[]) => FidanArray<T>;
export declare const value: <T>(val?: T) => FidanValue<T>;
export declare const compute: <T>(fn: (val: T, changedItem?: any) => void, ...args: any[]) => FidanValue<any>;
export declare const beforeCompute: <T>(fn: (nextValue?: T, prevValue?: T, changedItem?: any) => void, ...args: any[]) => FidanValue<any>;
export declare const destroy: (item: any) => void;
