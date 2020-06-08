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

      depends = innerFn["c_depends"];
      if (depends.length)
        for (var i = 0; i < depends.length; i++) {
          if (depends[i].compute) {
            depends[i](depends[i].compute(), depends[i]);
          } else {
            depends[i](innerFn.$val,innerFn);
          }
        }
    }
  };

  innerFn["$val"] = val;
  innerFn["bc_depends"] = [];
  innerFn["c_depends"] = [];
  innerFn.debugName = (name: string) => {
    Object.defineProperty(innerFn, "name", { value: name });
    return innerFn;
  };
  innerFn.toString = innerFn.toJSON = () => innerFn["$val"] && innerFn["$val"].toJSON ? innerFn["$val"].toJSON() : innerFn["$val"];
  innerFn.depends = (...deps:(FidanValue<any> | Function)[]): any => {
    for (var i = 0; i < deps.length; i++) innerFn["c_depends"].push(deps[i]);
    innerFn(innerFn()); //trigger to c_depends
    return innerFn;
  };
  return innerFn;
};

export const computed = <T>(
  fn: (val: T, opt?: ComputionMethodArguments<T>) => any,
  dependencies?: any[]
): any => {
  autoTrackDependencies = dependencies ? null : [];
  const cmp = value<T>();
  const val = fn(undefined, { computedItem: cmp } as any);
  cmp.$val = val;
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
