import {
  compute,
  FidanValue,
  htmlProps,
  arrayMap as fidanArrayMap
} from "@fidanjs/runtime";

export * from "./events";
export * from "./array-map";

export const arrayMap = (
  parent: Node & ParentNode,
  arr: FidanValue<any[]>,
  renderCallback?: (item: any, idx?: number) => any,
  marker?: Element
) => {
  fidanArrayMap(arr, parent, marker, renderCallback, "reconcile");
};

export const insert = (
  parent: Node,
  accessor: any,
  init?: any,
  marker?: Node
) => {
  if (typeof accessor === "object") {
    if (Array.isArray(accessor)) {
      accessor.forEach(item => {
        parent.insertBefore(item, marker);
      });
    } else {
      parent.insertBefore(accessor, marker);
    }
  } else if (typeof accessor === "function") {
    const node = document.createTextNode("");
    if (accessor.hasOwnProperty("$val")) {
      compute(() => {
        node.data = accessor();
        if (!node.parentNode) {
          parent.insertBefore(node, marker);
        }
      });
    } else {
      node.data = accessor();
      parent.insertBefore(node, marker);
    }
  } else {
    const node = document.createTextNode(accessor);
    parent.insertBefore(node, marker);
  }
};

export const spread = (node: HTMLElement, accessor: any) => {
  if (typeof accessor === "function") {
    accessor(node);
  } else {
    if (typeof accessor === "object") {
      for (var key in accessor) {
        accessor[key] != null &&
          attr(
            node,
            key,
            !htmlProps[key] || key.indexOf("-") !== -1,
            accessor[key]
          );
      }
      return;
    } else if (accessor instanceof Node === false)
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
      compute(() => node.setAttribute(attributeName, cmp()), [cmp]);
    } else {
      compute(() => (node[attributeName] = cmp()), [cmp]);
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
  condition: {
    test: () => boolean | FidanValue<any>;
    consequent: any;
    alternate: any;
  },
  init?: any,
  marker?: Node
) => {
  let oldElement = null;
  let lastVal = false;
  const conditionCompute = condition.test.hasOwnProperty("$val")
    ? condition.test
    : compute(condition.test);
  compute(() => {
    if (oldElement && parent.childElementCount === 0) {
      return;
    }
    const val = !!conditionCompute();
    if (val !== lastVal) {
      if (parent && parent.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        parent = marker.parentNode;
      }
      let newElement = val ? condition.consequent : condition.alternate;
      if (newElement instanceof Node === false)
        newElement = document.createTextNode(newElement || "");
      if (oldElement) {
        parent.replaceChild(newElement, oldElement);
      } else {
        parent.insertBefore(newElement, marker);
      }
      oldElement = newElement;
    }
    lastVal = val;
  }, [conditionCompute]);
};
