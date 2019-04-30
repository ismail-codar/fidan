import { FidanValue } from ".";
import { overrideArrayMutators } from "./overrided-array";

let autoTrackDependencies: any[] = null;

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
      let depends = innerFn["bc_depends"];
      if (depends.length)
        for (var i = 0; i < depends.length; i++) {
          depends[i].beforeCompute(val, innerFn["$val"], innerFn);
        }
      innerFn["$val"] = val;
      if (Array.isArray(val)) {
        overrideArrayMutators(innerFn);
      }
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
  innerFn.depends = (dependencies: () => FidanValue<any>[]): FidanValue<T> => {
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
  dependencies?: () => FidanValue<any>[]
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
  dependencies: () => FidanValue<any>[]
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
