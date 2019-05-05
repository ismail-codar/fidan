import { compute } from "@fidanjs/runtime";

export * from "./events";
export * from "./array-map";

const nop: any = () => {};

export const cleanup = nop;

export const wrap = <T>(fn: (prev?: T) => T) => {
  debugger;
  compute(fn);
};

export const sample = <T>(fn: () => T) => {
  return fn();
};

export const root = <T>(fn: (dispose: () => void) => T) => {
  return fn(() => {
    return null;
  });
};

export const insert = (parent, accessor) => {
  if (typeof accessor === "object") {
    parent.appendChild(accessor);
  } else if (typeof accessor === "function") {
    compute(
      () => {
        parent.textContent = accessor();
      },
      () => [accessor]
    );
  } else {
    parent.textContent = accessor;
  }
};

export const spread = (node: HTMLElement, accessor: any) => {
  if (typeof accessor === "function") {
    accessor(node);
  } else {
    debugger;
  }
};
