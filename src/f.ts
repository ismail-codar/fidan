import { EventedArray } from "./evented-array";
import { FidanArray, FidanValue } from ".";

let animFrameId = 0;
const arrayRefresh = (arr: FidanArray<any>) => {
  if (animFrameId) cancelAnimationFrame(animFrameId);
  animFrameId = window.requestAnimationFrame(() => {
    const depends = arr["c_depends"];
    console.log(depends);
    if (depends.length)
      for (var i = 0; i < depends.length; i++) {
        depends[i](depends[i].compute(arr.$val));
      }
  });
};

const anyPropertyChange = (obj: FidanValue<any>, callback: () => any) => {
  // TODO deep check & isArray
  for (var key in obj) {
    if (obj[key].hasOwnProperty("$val")) {
      compute(callback, obj[key]);
    }
  }
};

const arrayItemsAnyPropertyChange = (arr: any[], callback: () => any) => {
  console.log(arr.length);
  arr.forEach(item => {
    console.log(item);
    anyPropertyChange(item as any, callback);
  });
};

export const array = <T>(items: T[]): FidanArray<T> => {
  const arr = value(new EventedArray(items)) as FidanArray<T>;
  arr["toJSON"] = () => arr.$val.innerArray;

  arr.$val.on("itemadded", e => {
    anyPropertyChange(e.item, () => arrayRefresh(arr));
    arrayRefresh(arr);
  });
  arr.$val.on("itemremoved", arrayRefresh);
  arr.$val.on("itemset", e => {
    anyPropertyChange(e.item, () => arrayRefresh(arr));
    arrayRefresh(arr);
  });

  arrayItemsAnyPropertyChange(arr.$val, () => arrayRefresh(arr));

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
        arrayItemsAnyPropertyChange(val, () => arrayRefresh(innerFn));
      } else if (val && val.hasOwnProperty("innerArray")) {
        // val.innerArray = val.innerArray.slice(0); array reuseMode !!!
        var arr = new EventedArray(val.innerArray.slice(0));
        arr.setEventsFrom(val);
        val = arr;
        // arrayItemsAnyPropertyChange(val, () => arrayRefresh(innerFn));
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

  if (Array.isArray(val)) {
    val = new EventedArray(val.slice(0));
  } else if (val && val.hasOwnProperty("innerArray")) {
    val = new EventedArray(val["innerArray"].slice(0));
  }
  innerFn["$val"] = val;
  innerFn["bc_depends"] = [];
  innerFn["c_depends"] = [];
  innerFn.toString = innerFn.toJSON = () => innerFn["$val"];
  return innerFn;
};

export const compute = <T>(
  fn: (val: T, changedItem?) => void,
  ...args: any[]
) => {
  const cmp = value(fn(undefined));
  cmp["compute"] = fn;
  for (var i = 0; i < args.length; i++) args[i]["c_depends"].push(cmp);
  return cmp;
};

export const beforeCompute = <T>(
  initalValue: T,
  fn: (nextValue?: T, prevValue?: T, changedItem?) => void,
  ...args: any[]
) => {
  const cmp = value(fn(initalValue));
  cmp["beforeCompute"] = fn;
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
