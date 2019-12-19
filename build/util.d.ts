import { FidanValue, DataArrayEvents } from ".";
export declare const injectToProperty: (obj: Object, propertyKey: string, val: FidanValue<any>) => void;
export declare const inject: <T extends Object>(obj: T) => T;
export declare const debounce: (func: any, wait: any, immediate?: any) => () => void;
export declare const transformToDataArrayEvents: <T>(opt: {
    computedItem: FidanValue<T[]>;
    method: string;
    args: any[];
}, events: DataArrayEvents<T>) => void;
