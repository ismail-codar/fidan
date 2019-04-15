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

export const array = <T>(items: T[]): FidanArray<T[]> => {
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

const setInnerValue = (innerFn, prop: string, val) => {
  if (val == null) {
    innerFn[prop] = val;
  } else {
    if (!innerFn[prop]) {
      if (Array.isArray(val)) {
        innerFn[prop] = new EventedArray(val.slice(0));
      } else if (val.hasOwnProperty("innerArray")) {
        const arr = new EventedArray(
          val.innerArray.slice(0)
        ) as EventedArrayReturnType<any>;
        arr.setEventsFrom(val);
        innerFn[prop] = arr;
      } else {
        innerFn[prop] = val;
      }
    } else {
      if (Array.isArray(val)) {
        innerFn[prop].innerArray = val.slice(0);
      } else if (val.hasOwnProperty("innerArray")) {
        innerFn[prop].innerArray = val.innerArray.slice(0);
        innerFn[prop].setEventsFrom(val);
      } else {
        innerFn[prop] = val;
      }
    }
  }
};

export const value = <T>(val?: T, freezed?: boolean): FidanValue<T> => {
  const innerFn: any = (val?) => {
    if (val === undefined) {
      return innerFn["$next"];
    } else {
      setInnerValue(innerFn, "$next", val);
      const depends = innerFn["depends"];
      if (depends.length) {
        for (var i = 0; i < depends.length; i++) {
          !depends[i]["freezed"] &&
            depends[i](depends[i].compute(val, innerFn["$val"], innerFn));
        }
      }
      innerFn["$val"] = val;
    }
  };

  innerFn["$val"] = val;
  setInnerValue(innerFn, "$next", val);
  innerFn["freezed"] = freezed;
  innerFn["depends"] = [];
  innerFn.toString = innerFn.toJSON = () => innerFn["$val"].toString();
  return innerFn;
};

export const computeBy = <T>(
  initial: FidanValue<T>,
  fn: (nextValue?, prevValue?, changedItem?) => void,
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
