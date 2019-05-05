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

function clearAll(
  parent: Node,
  current: any,
  marker?: Node,
  startNode?: Node | null
) {
  if (!marker) return (parent.textContent = "");
  if (Array.isArray(current)) {
    for (let i = 0; i < current.length; i++) {
      parent.removeChild(current[i]);
    }
  } else if (current != null && current != "") {
    if (startNode !== undefined) {
      let node = marker.previousSibling,
        tmp;
      while (node !== startNode) {
        tmp = (node as Node).previousSibling;
        parent.removeChild(node as Node);
        node = tmp;
      }
    } else parent.removeChild(marker.previousSibling as Node);
  }
  return "";
}

function insertExpression(
  parent: Node,
  value: any,
  current?: any,
  marker?: Node
) {
  if (value === current) return current;
  parent = (marker && marker.parentNode) || parent;
  const t = typeof value;
  if (t === "string" || t === "number") {
    if (t === "number") value = value.toString();
    if (marker) {
      if (value === "") clearAll(parent, current, marker);
      else if (current !== "" && typeof current === "string") {
        (marker.previousSibling as Text).data = value;
      } else {
        const node = document.createTextNode(value);
        if (current !== "" && current != null) {
          parent.replaceChild(node, marker.previousSibling as Node);
        } else parent.insertBefore(node, marker);
      }
      current = value;
    } else {
      if (current !== "" && typeof current === "string") {
        current = (parent.firstChild as Text).data = value;
      } else current = parent.textContent = value;
    }
  } else if (value == null || t === "boolean") {
    current = clearAll(parent, current, marker);
  } else if (t === "function") {
    wrap(function() {
      current = insertExpression(parent, value(), current, marker);
    });
  } else if (value instanceof Node) {
    if (Array.isArray(current)) {
      if (current.length === 0) {
        parent.insertBefore(value, marker as any);
      } else if (current.length === 1) {
        parent.replaceChild(value, current[0]);
      } else {
        clearAll(parent, current, marker);
        parent.appendChild(value);
      }
    } else if (current == null || current === "") {
      parent.insertBefore(value, marker as any);
    } else {
      parent.replaceChild(
        value,
        (marker && marker.previousSibling) || (parent.firstChild as Node)
      );
    }
    current = value;
  } else if (Array.isArray(value)) {
    debugger;
    // let array = normalizeIncomingArray([], value);
    // clearAll(parent, current, marker);
    // if (array.length !== 0) {
    //   for (let i = 0, len = array.length; i < len; i++) {
    //     parent.insertBefore(array[i], marker as any);
    //   }
    // }
    // current = array;
  } else {
    throw new Error("content must be Node, stringable, or array of same");
  }

  return current;
}

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
