import { FidanValue, ComputionMethodArguments } from ".";
export declare const value: <T>(val?: T) => FidanValue<T>;
export declare const compute: <T>(fn: (val: T, opt?: ComputionMethodArguments<T>) => any, dependencies?: any[]) => any;
export declare const beforeCompute: <T>(initalValue: T, fn: (nextValue?: T, opt?: ComputionMethodArguments<T>) => void, deps: FidanValue<any>[]) => FidanValue<T>;
