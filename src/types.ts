export interface DataArrayEvents<T> {
  onAdd?: (args: T[]) => void;
  onRemove?: (args: T[]) => void;
  onUpdate?: (args: T[]) => void;
}

export type ComputionMethodArguments<T> = T extends Array<any>
  ? {
      prevVal?: T;
      caller: FidanValue<T>;
      method: string;
      args: any[];
    }
  : { caller: FidanValue<any>; prevVal?: T };

export interface FidanValue<T> {
  (val?: T, opt?: ComputionMethodArguments<T>): T;
  $val: T;
  debugName: (name: string) => FidanValue<T>;
  depends: (
    ...deps: (
      | FidanValue<any>
      | ((val: any, computedItem?: FidanValue<any>) => any)
    )[]
  ) => FidanValue<T>;
  beforeCompute: (val?: T, opt?: ComputionMethodArguments<T>) => void;
  compute: (val?: T, opt?: ComputionMethodArguments<T>) => T;
}

type FidanArrayType<T extends Array<T[0]>> = FidanValue<T> & Array<T[0]>;
export interface FidanArray<T extends Array<any>> extends FidanArrayType<T> {
  size: FidanValue<number>;
  map: (item: any, index?: number, renderMode?: 'reuse' | 'reconcile') => any;
}

export type FidanValueFn<T> = FidanValue<T> &
  (T extends Array<any> ? FidanArray<T> : unknown);
