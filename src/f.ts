import { EventedArray } from "./evented-array";
import { FidanArray, FidanValue, FidanData } from ".";

export const array = <T>(items: T[]): FidanArray<T> => {
  const arr = value(new EventedArray(items)) as FidanArray<T>;
  arr["toJSON"] = () => arr.$val.innerArray;

  arr.size = value(items.length);

  arr.$val.on("itemadded", () => arr.size(arr.$val.innerArray.length));
  arr.$val.on("itemremoved", () => arr.size(arr.$val.innerArray.length));

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
        // val.innerArray = val.innerArray.slice(0); array reuseMode !!!
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

      if (val.hasOwnProperty("innerArray")) {
        innerFn.size && innerFn.size(val.innerArray.length);
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
  innerFn.depends = (...args: FidanData<T>[]): FidanValue<T> => {
    for (var i = 0; i < args.length; i++) innerFn["c_depends"].push(args[i]);
    return innerFn;
  };
  innerFn.debugName = (name: string) => {
    Object.defineProperty(innerFn, "name", { value: name });
    return innerFn;
  };
  innerFn.toString = innerFn.toJSON = () => innerFn["$val"];
  return innerFn;
};

export const compute = <T>(
  fn: (val: T, changedItem?) => T,
  ...args: FidanData<T>[]
) => {
  const cmp = value(fn(undefined));
  cmp["compute"] = fn;
  for (var i = 0; i < args.length; i++) args[i]["c_depends"].push(cmp);
  return cmp;
};

export const beforeCompute = <T>(
  initalValue: T,
  fn: (nextValue?: T, prevValue?: T, changedItem?) => void,
  ...args: FidanData<T>[]
) => {
  const cmp = value(fn(initalValue));
  cmp["beforeCompute"] = fn;
  for (var i = 0; i < args.length; i++) args[i]["bc_depends"].push(cmp);
  return cmp;
};

export const destroy = (item: any) => {
  delete item["compute"];
  delete item["c_depends"];
};
