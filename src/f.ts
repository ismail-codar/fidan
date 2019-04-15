import { EventedArray } from "./evented-array";

export interface FidanValue<T> {
  (val?: T): T;
  readonly $val: T;
  readonly $next: T;
  freezed: boolean;
}

export type FidanArrayEventType =
  | "itemadded"
  | "itemset"
  | "itemremoved"
  | "beforemulti"
  | "aftermulti";

export interface EventedArrayReturnType<T> {
  on: any;
  off: any;
  innerArray: T[];
  setEventsFrom: (val: EventedArrayReturnType<T>) => void;
}

export interface FidanArray<T> {
  (val?: T[]): T[] & EventedArrayReturnType<T>;
  readonly $val: T[] & EventedArrayReturnType<T>;
  readonly $next: T[] & EventedArrayReturnType<T>;
  freezed: boolean;
}

export const array = <T>(items: T[]): FidanArray<T> => {
  const arr = value(new EventedArray(items)) as any;
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

export const value = <T>(val?: T, freezed?: boolean): FidanValue<T> => {
  const innerFn: any = (val?) => {
    if (val === undefined) {
      return innerFn["$val"];
    } else {
      if (Array.isArray(val)) {
        val = new EventedArray(val.slice(0));
        val.setEventsFrom(innerFn["$val"]);
      } else if (val && val.hasOwnProperty("innerArray")) {
        var arr = new EventedArray(val.innerArray.slice(0));
        arr.setEventsFrom(val);
        val = arr;
      }
      let depends = innerFn["bc_depends"];
      for (var i = 0; i < depends.length; i++) {
        !depends[i]["freezed"] &&
          depends[i].beforeCompute(val, innerFn["$val"], innerFn);
      }
      innerFn["$val"] = val;
      depends = innerFn["c_depends"];
      for (var i = 0; i < depends.length; i++) {
        !depends[i]["freezed"] && depends[i](depends[i].compute(val));
      }
    }
  };

  innerFn["$val"] = val;
  innerFn["freezed"] = freezed;
  innerFn["bc_depends"] = [];
  innerFn["c_depends"] = [];
  innerFn.toString = innerFn.toJSON = () => innerFn["$val"].toString();
  return innerFn;
};

export const computeBy = <T>(
  initial: FidanValue<T>,
  fn: (val?: T, changedItem?) => void,
  ...args: any[]
) => {
  var cmp = value(undefined);
  cmp["compute"] = fn;
  cmp(fn(initial.$val, cmp));
  args.splice(0, 0, initial);
  for (var i = 0; i < args.length; i++) args[i]["c_depends"].push(cmp);
  return cmp;
};

export const beforeComputeBy = <T>(
  initial: FidanValue<T>,
  fn: (nextValue?, prevValue?, changedItem?) => void,
  ...args: any[]
) => {
  var cmp = value(undefined);
  cmp["beforeCompute"] = fn;
  cmp(fn(initial.$val, undefined, cmp));
  args.splice(0, 0, initial);
  for (var i = 0; i < args.length; i++) args[i]["bc_depends"].push(cmp);
  return cmp;
};

export const compute = <T>(
  fn: (val: T, changedItem?) => void,
  ...args: any[]
) => {
  const cmp = value(undefined);
  cmp["compute"] = fn;
  cmp(fn(undefined, cmp));
  for (var i = 0; i < args.length; i++) args[i]["c_depends"].push(cmp);
  return cmp;
};

export const beforeCompute = <T>(
  fn: (nextValue?: T, prevValue?: T, changedItem?) => void,
  ...args: any[]
) => {
  const cmp = value(undefined);
  cmp["beforeCompute"] = fn;
  cmp(fn(undefined, undefined, cmp));
  for (var i = 0; i < args.length; i++) args[i]["bc_depends"].push(cmp);
  return cmp;
};

// TODO typedCompute, typedValue ...
// export const computeReturn = <T>(fn: () => T, ...args: any[]): T =>
//   initCompute(fn, ...args) as any;

// export const setCompute = (prev: any, fn: () => void, ...args: any[]) => {
//   destroy(prev);
//   return initCompute(prev, fn, ...args);
// };

export const destroy = (item: any) => {
  delete item["compute"];
  delete item["c_depends"];
};
