import { EventedArray } from "./evented-array";

export interface FidanValue<T> {
  (val: T): void;
  readonly $val: T;
  freezed: boolean;
}

export type FidanArrayEventType = "itemadded" | "itemset" | "itemremoved";

export const value = <T>(val?: T, freezed?: boolean): FidanValue<T> => {
  if (val && val["$val"] != undefined)
    throw "Fidan: Higher ordered signals is not supported.";
  const innerFn: any = (val?) => {
    if (val === undefined) {
      return innerFn["$val"];
    } else {
      const depends = innerFn["depends"];
      if (depends.length)
        for (var i = 0; i < depends.length; i++)
          !depends[i]["freezed"] &&
            depends[i](depends[i].compute(val, innerFn["$val"]));
      if (Array.isArray(val)) {
        innerFn["$val"].innerArray = val;
      } else innerFn["$val"] = val;
    }
  };
  innerFn["$val"] = val;
  innerFn["freezed"] = freezed;

  innerFn["depends"] = [];
  innerFn.toString = innerFn.toJSON = () => innerFn["$val"].toString();
  return innerFn;
};

export const array = <T>(
  items: T[]
): {
  on?: (
    type: FidanArrayEventType,
    callback: (e: { item: T; index: number }) => void
  ) => void;
  removeEventListener?: (type: FidanArrayEventType) => void;
  $val: T[];
} & FidanValue<T[]> => {
  const arr = value(new EventedArray(items)) as any;
  arr.on = arr.$val.on;
  arr.off = arr.$val.off;
  arr.toJSON = () => arr.$val.innerArray;

  return arr;
};

export const on = (
  arr: any[],
  type: FidanArrayEventType,
  callback: (e: { item: any; index: number }) => void
) => {
  arr["$val"].on(type, callback);
};

export const off = (
  arr: any[],
  type: FidanArrayEventType,
  callback: (e: { item: any; index: number }) => void
) => {
  arr["$val"].off(type, callback);
};

export const compute = <T>(
  initial: FidanValue<T>,
  fn: (nextVal, prevVal?) => void,
  ...args: any[]
) => {
  var cmp = value();
  cmp["compute"] = fn;
  args.splice(0, 0, initial);
  for (var i = 0; i < args.length; i++) args[i]["depends"].push(cmp);
  fn(initial.$val);
};

export const initCompute = (fn: () => any, ...args: any[]) => {
  const cValue = value(fn());
  compute(
    null,
    () => {
      cValue(fn());
    },
    ...args
  );
  return cValue;
};

// TODO typedCompute, typedValue ...
export const computeReturn = <T>(fn: () => T, ...args: any[]): T =>
  initCompute(fn, ...args) as any;

export const setCompute = (prev: any, fn: () => void, ...args: any[]) => {
  destroy(prev);
  return initCompute(prev, fn, ...args);
};

export const destroy = (item: any) => {
  delete item["compute"];
  delete item["depends"];
};
