import { ComputionMethodArguments, FidanValueFn, FidanArray } from './types';
export declare const value: <T>(val?: T) => FidanValueFn<T>;
export declare const computed: <T>(fn: (val: T, opt?: ComputionMethodArguments<T>) => any, dependencies?: any[]) => any;
export declare const createFidanArray: (dataArray: FidanArray<any[]>) => void;
