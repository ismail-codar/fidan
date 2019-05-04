import { compute } from "@fidanjs/runtime";

const nop: any = () => {};

export default {
  wrap<T>(fn: (prev?: T) => T) {
    debugger;
    compute(fn);
  },
  sample: <T>(fn: () => T) => {
    return fn();
  },
  root: <T>(fn: (dispose: () => void) => T) => {
    return fn(() => {
      return null;
    });
  },
  cleanup: nop,
  insert: (parent, accessor) => {
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
  }
};
