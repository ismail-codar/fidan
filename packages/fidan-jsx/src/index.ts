import { compute, FidanValue } from "@fidanjs/runtime";

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

export const insert = (
  parent: Node,
  accessor: any,
  init?: any,
  marker?: Node
) => {
  if (typeof accessor === "object") {
    marker.appendChild(accessor);
  } else if (typeof accessor === "function") {
    const node = document.createTextNode("");
    compute(
      () => {
        node.data = accessor();
        if (!node.parentNode) {
          parent.insertBefore(node, marker);
        }
      },
      () => [accessor]
    );
  } else {
    const node = document.createTextNode(accessor);
    parent.insertBefore(node, marker);
  }
};

export const spread = (node: HTMLElement, accessor: any) => {
  if (typeof accessor === "function") {
    accessor(node);
  } else {
    debugger;
  }
};

export const attr = (
  node: Element,
  attributeName: string,
  setAttr: boolean,
  cmp: any
) => {
  if (cmp.hasOwnProperty("$val")) {
    if (setAttr) {
      compute(() => node.setAttribute(attributeName, cmp()), () => [cmp]);
    } else {
      compute(() => (node[attributeName] = cmp()), () => [cmp]);
    }
  } else {
    if (typeof cmp === "function") {
      cmp = cmp(node);
    }
    if (setAttr) {
      node.setAttribute(attributeName, cmp);
    } else {
      node[attributeName] = cmp;
    }
  }
};
