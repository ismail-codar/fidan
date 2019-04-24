import { EventedArray } from "./evented-array";
import { FidanArray, FidanValue, FidanData } from ".";

let autoTrackDependencies: any[] = null;

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
      if (
        autoTrackDependencies &&
        autoTrackDependencies.indexOf(innerFn) === -1
      ) {
        autoTrackDependencies.push(innerFn);
      }
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

      if (val && val.hasOwnProperty("innerArray")) {
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
  innerFn.depends = (dependencies: () => FidanData<any>[]): FidanValue<T> => {
    const deps = dependencies();
    for (var i = 0; i < deps.length; i++) innerFn["c_depends"].push(deps[i]);
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
  fn: (val: T, changedItem?) => any,
  dependencies?: () => FidanData<any>[]
) => {
  autoTrackDependencies = dependencies ? null : [];
  const val = fn(undefined);
  const deps = autoTrackDependencies ? autoTrackDependencies : dependencies();
  autoTrackDependencies = null;
  const cmp = value(val);
  cmp["compute"] = fn;
  for (var i = 0; i < deps.length; i++) deps[i]["c_depends"].push(cmp);
  return cmp;
};

export const beforeCompute = <T>(
  initalValue: T,
  fn: (nextValue?: T, prevValue?: T, changedItem?) => void,
  dependencies: () => FidanData<any>[]
) => {
  const cmp = value(fn(initalValue));
  cmp["beforeCompute"] = fn;
  const deps = dependencies();
  for (var i = 0; i < deps.length; i++) deps[i]["bc_depends"].push(cmp);
  return cmp;
};

export const destroy = (item: any) => {
  delete item["compute"];
  delete item["c_depends"];
};
