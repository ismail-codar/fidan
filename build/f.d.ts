import { FidanValue } from ".";
export declare const value: <T>(val?: T) => FidanValue<T>;
export declare const compute: <T>(fn: (val: T, changedItem?: any) => any, dependencies?: () => FidanValue<any>[]) => FidanValue<any>;
export declare const beforeCompute: <T>(initalValue: T, fn: (nextValue?: T, prevValue?: T, changedItem?: any) => void, dependencies: () => FidanValue<any>[]) => FidanValue<void>;
export declare const destroy: (item: any) => void;
