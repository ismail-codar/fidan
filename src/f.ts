import { EventedArray } from "./evented-array";

export interface FidanValue<T> {
  (val?: T): T;
  readonly $val: T;
  readonly $next: T;
  freezed: boolean;
}

export type FidanArrayEventType = "itemadded" | "itemset" | "itemremoved";

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

const cloneObject = val => {
  if (val === null) return null;
  if (Array.isArray(val) || val.hasOwnProperty("innerArray")) {
    return val["slice"](0);
  } else {
    return Object.assign({}, val);
  }
};

export const value = <T>(val?: T, freezed?: boolean): FidanValue<T> => {
  const innerFn: any = (val?) => {
    if (val === undefined) {
      return innerFn["$next"];
    } else {
      if (typeof val === "object") {
        innerFn["$next"].innerArray = cloneObject(val);
      } else {
        innerFn["$next"] = val;
      }

      const depends = innerFn["depends"];
      if (depends.length)
        for (var i = 0; i < depends.length; i++)
          !depends[i]["freezed"] &&
            depends[i](depends[i].compute(val, innerFn));
      if (typeof val === "object") {
        innerFn["$val"].innerArray = cloneObject(val);
      } else innerFn["$val"] = val;
    }
  };

  if (typeof val === "object") {
    innerFn["$next"] = cloneObject(val);
    innerFn["$val"] = cloneObject(val);
  } else {
    innerFn["$next"] = val;
    innerFn["$val"] = val;
  }
  innerFn["freezed"] = freezed;

  innerFn["depends"] = [];
  innerFn.toString = innerFn.toJSON = () => innerFn["$val"].toString();
  return innerFn;
};

export const computeBy = <T>(
  initial: FidanValue<T>,
  fn: (nextValue?, changedItem?) => void,
  ...args: any[]
) => {
  var cmp = value(undefined);
  cmp["compute"] = fn;
  cmp(fn(initial.$val, cmp));
  args.splice(0, 0, initial);
  for (var i = 0; i < args.length; i++) args[i]["depends"].push(cmp);
  return cmp;
};

export const compute = <T>(
  fn: (nextValue?, changedItem?) => void,
  ...args: any[]
) => {
  const cmp = value(undefined);
  cmp["compute"] = fn;
  cmp(fn(undefined, cmp));
  for (var i = 0; i < args.length; i++) args[i]["depends"].push(cmp);
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
  delete item["depends"];
};
