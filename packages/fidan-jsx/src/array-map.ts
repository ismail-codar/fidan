import { FidanArray, arrayMap } from "@fidanjs/runtime";

export const jsxArrayMap = <T>(
  arr: FidanArray<T[]>,
  renderCallback: (data: T) => DocumentFragment,
  renderMode?: "reuse" | "reconcile"
) => {
  return parentElement => {
    arrayMap(arr, parentElement, undefined, renderCallback, renderMode);
  };
};
