import { FidanValue } from ".";
export declare const value: <T>(val?: T) => FidanValue<T>;
export declare const compute: <T>(fn: (val: T, changedItem?: any) => any, dependencies?: any[]) => any;
export declare const beforeCompute: <T>(initalValue: T, fn: (nextValue?: T, prevValue?: T, changedItem?: any) => void, deps: FidanValue<any>[]) => FidanValue<void>;
