import { FidanArray, FidanValue, FidanData } from ".";
export declare const array: <T>(items: T[]) => FidanArray<T>;
export declare const value: <T>(val?: T) => FidanValue<T>;
export declare const compute: <T>(fn: (val: T, changedItem?: any) => T, ...args: FidanData<T>[]) => FidanValue<T>;
export declare const beforeCompute: <T>(initalValue: T, fn: (nextValue?: T, prevValue?: T, changedItem?: any) => void, ...args: FidanData<T>[]) => FidanValue<void>;
export declare const destroy: (item: any) => void;
