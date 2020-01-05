import { FidanValue, FidanArray, ComputionMethodArguments } from ".";

let autoTrackDependencies: any[] = null;

export const value = <T>(val?: T): FidanValue<T> & (T extends Array<any> ? FidanArray<T> : unknown) => {
  if (val && val.hasOwnProperty("$val")) return val as any;
  const innerFn: any = (val?: T, opt?: ComputionMethodArguments<T>) => {
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
          depends[i].beforeCompute(val, opt);
        }
      innerFn["$val"] = val;
      if (Array.isArray(val)) {
        overrideArrayMutators(innerFn);
      }
      depends = innerFn["c_depends"];
      if (depends.length)
        for (var i = 0; i < depends.length; i++) {
          const dependFn = depends[i].compute ? depends[i].compute : depends[i];
          dependFn(val, opt);
        }
    }
  };

  innerFn["$val"] = val;
  if (Array.isArray(val)) {
    overrideArrayMutators(innerFn);
  }
  innerFn["bc_depends"] = [];
  innerFn["c_depends"] = [];
  innerFn.depends = (deps:(FidanValue<any> | Function)[]): any => {
    for (var i = 0; i < deps.length; i++) innerFn["c_depends"].push(deps[i]);
    return innerFn;
  };
  innerFn.debugName = (name: string) => {
    Object.defineProperty(innerFn, "name", { value: name });
    return innerFn;
  };
  innerFn.toString = innerFn.toJSON = () => innerFn["$val"] && innerFn["$val"].toJSON ? innerFn["$val"].toJSON() : innerFn["$val"];
  return innerFn;
};

export const compute = <T>(
  fn: (val: T, opt?: ComputionMethodArguments<T>) => any,
  dependencies?: any[]
): any => {
  autoTrackDependencies = dependencies ? null : [];
  const cmp = value<T>();
  const val = fn(undefined, { computedItem: cmp } as any);
  cmp.$val = val;
  if (Array.isArray(val)) {
    overrideArrayMutators(cmp as any);
  }
  const deps = autoTrackDependencies ? autoTrackDependencies : dependencies;
  autoTrackDependencies = null;
  cmp["compute"] = fn;
  for (var i = 0; i < deps.length; i++) deps[i]["c_depends"].push(cmp);
  return cmp;
};

export const beforeCompute = <T>(
  initalValue: T,
  fn: (nextValue?: T, opt?: ComputionMethodArguments<T>) => void,
  deps: FidanValue<any>[]
) => {
  const cmp = value<T>(fn(initalValue, { computedItem: {} } as any) as any);
  cmp["beforeCompute"] = fn;
  for (var i = 0; i < deps.length; i++) deps[i]["bc_depends"].push(cmp);
  return cmp;
};

const overrideArrayMutators = (dataArray: FidanArray<any[]>) => {
  if (!dataArray.size) dataArray.size = value(dataArray.$val.length);
  else dataArray.size(dataArray.$val.length);
  if (dataArray.$val["$overrided"]) return;
  dataArray.$val["$overrided"] = true;
  [
    "copyWithin",
    "fill",
    "pop",
    "push",
    "reverse",
    "shift",
    "sort",
    "splice",
    "unshift"
  ].forEach(method => {
    dataArray.$val[method] = function () {
      const arr = dataArray.$val.slice(0);
      const size1 = arr.length;
      const ret = Array.prototype[method].apply(arr, arguments);
      const size2 = arr.length;
      if (size1 !== size2) dataArray.size(size2);
      dataArray(arr, {
        method,
        computedItem: dataArray,
        args: [...arguments]
      });
      return ret;
    };
  });
};
