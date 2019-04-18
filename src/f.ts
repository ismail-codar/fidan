import { EventedArray } from "./evented-array";
import { FidanArray, FidanValue } from ".";

export const array = <T>(items: T[]): FidanArray<T> => {
  const arr = value(new EventedArray(items)) as any;
  arr.toJSON = () => arr.$val.innerArray;

  return arr;
};

export const value = <T>(val?: T): FidanValue<T> => {
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
      if (depends.length)
        for (var i = 0; i < depends.length; i++) {
          depends[i].beforeCompute(val, innerFn["$val"], innerFn);
        }
      innerFn["$val"] = val;
      depends = innerFn["c_depends"];
      if (depends.length)
        for (var i = 0; i < depends.length; i++) {
          depends[i](depends[i].compute(val));
        }
    }
  };

  innerFn["$val"] = val;
  innerFn["bc_depends"] = [];
  innerFn["c_depends"] = [];
  innerFn.toString = innerFn.toJSON = () => innerFn["$val"].toString();
  return innerFn;
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
  initalValue: T,
  fn: (nextValue?: T, prevValue?: T, changedItem?) => void,
  ...args: any[]
) => {
  const cmp = value(undefined);
  cmp["beforeCompute"] = fn;
  cmp(fn(initalValue, undefined, cmp));
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
