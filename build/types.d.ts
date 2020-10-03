export interface DataArrayEvents<T> {
    onAdd?: (args: T[]) => void;
    onRemove?: (args: T[]) => void;
    onUpdate?: (args: T[]) => void;
}
export declare type ComputionMethodArguments<T> = T extends Array<any> ? {
    caller: FidanValue<T>;
    method: string;
    args: any[];
} : {
    caller: FidanValue<any>;
};
export interface FidanValue<T> {
    (val?: T, opt?: ComputionMethodArguments<T>): T;
    $val: T;
    debugName: (name: string) => FidanValue<T>;
    depends: (...deps: (FidanValue<any> | ((val: any, computedItem?: FidanValue<any>) => any))[]) => FidanValue<T>;
    beforeCompute: (val?: T, opt?: ComputionMethodArguments<T>) => void;
    compute: (val?: T, opt?: ComputionMethodArguments<T>) => T;
}
export interface FidanArray<T extends Array<any>> extends FidanValue<T> {
    size: FidanValue<number>;
    map: (item: any, index?: number, renderMode?: 'reuse' | 'reconcile') => any;
}
export declare type FidanValueFn<T> = FidanValue<T> & (T extends Array<any> ? FidanArray<T> : unknown);
