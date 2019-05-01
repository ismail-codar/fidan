import { beforeCompute, compute } from "./f";
import { reuseNodes } from "./reuse-nodes";
import { FidanValue } from ".";
import reconcile from "./reconcile";

export const coditionalDom = (
  condition: () => boolean,
  dependencies: () => FidanValue<any>[],
  htmlFragment: DocumentFragment
) => (parentElement: Element, nextElement: Element) => {
  const childs = Array.from(htmlFragment.children);
  let inserted = false;
  compute(() => {
    if (condition()) {
      if (!inserted) {
        let tmpNextElement = nextElement;
        for (var i = childs.length - 1; i >= 0; i--) {
          const child = childs[i];
          tmpNextElement = parentElement.insertBefore(child, tmpNextElement);
        }
        inserted = true;
      }
    } else {
      childs.forEach(child => child.remove());
      inserted = false;
    }
  }, dependencies);
};

export const insertToDom = (parentElement, index, itemElement) => {
  const typeOf = typeof itemElement;
  if (typeOf === "function") {
    itemElement(parentElement);
  } else {
    if (typeOf !== "object") {
      itemElement = document.createTextNode(itemElement);
    }
    parentElement.insertBefore(itemElement, parentElement.children[index]);
  }
};

export const arrayMap = <T>(
  arr: FidanValue<T[]>,
  parentDom: Node & ParentNode,
  nextElement: Element,
  renderCallback: (item: any, idx?: number, isInsert?: boolean) => Node,
  renderMode?: "reuse" | "reconcile"
) => {
  beforeCompute(
    arr.$val,
    (nextVal, beforeVal) => {
      if (!renderMode) {
        const parentFragment = document.createDocumentFragment();
        parentDom.textContent = "";
        for (var i = 0; i < nextVal.length; i++) {
          insertToDom(parentFragment, i, renderCallback(nextVal[i], i));
        }
        parentDom.appendChild(parentFragment);
      } else {
        let renderFunction: (
          parent,
          renderedValues,
          data,
          createFn,
          noOp,
          beforeNode?,
          afterNode?
        ) => void = renderMode === "reconcile" ? reconcile : reuseNodes;
        renderFunction(
          parentDom,
          beforeVal || [],
          nextVal || [],
          nextItem => {
            // create
            return renderCallback(nextItem);
          },
          (nextItem, prevItem) => {
            // update
            // for (var key in nextItem) {
            //   if (prevItem[key].hasOwnProperty("$val")) {
            //     nextItem[key].depends = prevItem[key].depends;
            //     prevItem[key](nextItem[key]());
            //   }
            // }
          }
        );
      }
    },
    () => [arr]
  );
};
