import { FidanValue } from "./f";
import { EventedArray } from "./evented-array";
import { computeBy } from "./f";
import { reuseNodes } from "./reuse-nodes";

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

export const arrayMap = (
  arr: FidanValue<any[]>,
  parentDom: Node & ParentNode,
  renderReturn: (item: any, idx?: number, isInsert?: boolean) => void
) => {
  const oArr =
    arr.$val instanceof EventedArray ? arr.$val : new EventedArray(arr.$val);
  const arrVal = arr.$val;

  let parentRef: { parent: Node & ParentNode; next: Node } = null;
  oArr.on("beforemulti", function() {
    if (parentDom.parentNode) {
      parentRef = {
        parent: parentDom,
        next: (parentDom as Element).nextElementSibling
      };
      parentDom = document.createDocumentFragment();
    }
  });
  oArr.on("aftermulti", function() {
    if (parentRef) {
      parentRef.parent.insertBefore(parentDom, parentRef.next);
      parentDom = parentRef.parent;
    }
  });

  oArr.on("itemadded", function(e) {
    insertToDom(parentDom, e.index, renderReturn(e.item, e.index));
  });

  oArr.on("itemset", function(e) {
    parentDom.replaceChild(
      renderReturn(e.item, e.index) as any,
      parentDom.children.item(e.index)
    );
  });

  oArr.on("itemremoved", function(e) {
    parentDom.removeChild(parentDom.children.item(e.index));
  });
  arr(oArr);

  let firstRenderOnFragment = undefined;
  const arrayComputeRenderAll = function(nextVal) {
    if (firstRenderOnFragment === undefined && nextVal && nextVal.length > 0)
      firstRenderOnFragment = document.createDocumentFragment();
    reuseNodes(
      firstRenderOnFragment || parentDom,
      arrVal["innerArray"],
      nextVal || [],
      nextItem => {
        return renderReturn(nextItem);
      },
      (nextItem, prevItem) => {
        for (var key in nextItem) {
          if (prevItem[key].hasOwnProperty("$val")) {
            nextItem[key].depends = prevItem[key].depends;
            prevItem[key](nextItem[key]());
          }
        }
      }
    );
    if (firstRenderOnFragment) {
      parentDom.appendChild(firstRenderOnFragment);
      firstRenderOnFragment = null;
    }
  };

  computeBy(arr, arrayComputeRenderAll);
};
