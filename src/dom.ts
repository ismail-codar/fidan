import { FidanValue } from "./f";
import { EventedArray } from "./evented-array";
import { compute } from "./f";

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

  const arrayComputeRenderAll = () => {
    if (arrVal.length === 0) parentDom.textContent = "";
    else {
      let itemElement = null;
      const parentFragment = document.createDocumentFragment();
      parentDom.textContent = "";
      for (var i = parentDom.childElementCount; i < arrVal.length; i++) {
        itemElement = renderReturn(arrVal[i], i);
        if (typeof itemElement !== "object") {
          itemElement = document.createTextNode(itemElement);
        }
        parentFragment.insertBefore(itemElement, parentDom.children[i]);
      }
      parentDom.appendChild(parentFragment);
    }
  };

  compute(arrayComputeRenderAll, arr);
};
