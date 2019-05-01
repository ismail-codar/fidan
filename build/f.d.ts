import { FidanValue, FidanArray } from ".";
export declare const value: <T>(val?: T) => T extends any[] ? FidanArray<T> : FidanValue<T>;
export declare const compute: <T>(fn: (val: T, changedItem?: any) => any, dependencies?: () => FidanValue<any>[]) => FidanValue<any> | FidanArray<any>;
export declare const beforeCompute: <T>(initalValue: T, fn: (nextValue?: T, prevValue?: T, changedItem?: any) => void, dependencies: () => FidanValue<any>[]) => FidanValue<void>;
