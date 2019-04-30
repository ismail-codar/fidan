import { FidanValue } from ".";
export declare const injectToProperty: (obj: Object, propertyKey: string, val: FidanValue<any>) => void;
export declare const inject: <T extends Object>(obj: T) => T;
export declare const jsRoot: () => any;
