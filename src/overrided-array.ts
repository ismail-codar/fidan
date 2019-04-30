import { FidanValue } from ".";
import { value } from "./f";

export const overrideArrayMutators = <T extends Array<any>>(
  dataArray: FidanValue<T>
) => {
  dataArray.size = value(dataArray().length);
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
      const size1 = arr.length;
      Array.prototype[method].apply(arr, arguments);
      const size2 = arr.length;
      if (size1 !== size2) dataArray.size(size2);
      dataArray(arr);
    };
  });
};
