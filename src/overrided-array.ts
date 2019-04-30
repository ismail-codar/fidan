import { FidanArray } from ".";

export const overrideArrayMutators = <T>(dataArray: FidanArray<T>) => {
  // if (!dataArray.$val["$overrided"])
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
    dataArray.$val[method] = function() {
      const arr = this.slice(0);
      Array.prototype[method].apply(arr, arguments);
      dataArray(arr);
    };
    // dataArray.$val["$overrided"] = true;
  });
};
