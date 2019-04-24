import { FidanData } from ".";
export declare const setDefaults: <T>(obj: T, defaults: { [key in keyof T]?: any; }) => void;
export declare const injectToProperty: (obj: Object, propertyKey: string, val: FidanData<any>) => void;
export declare const inject: <T extends Object>(obj: T) => T;
export declare const jsRoot: () => any;
