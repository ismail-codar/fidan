import { FidanValue, FidanArray, ComputionMethodArguments } from ".";
export declare const value: <T>(val?: T) => T extends any[] ? FidanArray<T> : FidanValue<T>;
export declare const compute: <T>(fn: (val: T, opt?: ComputionMethodArguments<T>) => any, dependencies?: any[]) => any;
export declare const beforeCompute: <T>(initalValue: T, fn: (nextValue?: T, opt?: ComputionMethodArguments<T>) => void, deps: FidanValue<any>[]) => T extends any[] ? FidanArray<T> : FidanValue<T>;
