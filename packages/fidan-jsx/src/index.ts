import { compute, FidanValue, coditionalDom } from "@fidanjs/runtime";

export * from "./events";
export * from "./array-map";

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
    if (accessor instanceof Node === false)
      accessor = document.createTextNode(accessor || "");
    node.appendChild(accessor);
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

export const conditional = (
  parent: Node & ParentNode,
  accessor: any,
  init?: any,
  marker?: Node
) => {
  var oldElement = null;
  compute(() => {
    let newElement = accessor();
    if (newElement instanceof Node === false)
      newElement = document.createTextNode(newElement || "");
    if (oldElement) {
      parent.replaceChild(newElement, oldElement);
    } else {
      parent.insertBefore(newElement, marker);
    }
    oldElement = newElement;
  });
};
