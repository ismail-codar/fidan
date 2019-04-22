import { beforeCompute, compute } from "./f";
import { reuseNodes } from "./reuse-nodes";
import { FidanArray, FidanData } from ".";

export const coditionalDom = (
  condition: () => boolean,
  dependencies: () => FidanData<any>[],
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
  arr: FidanArray<T>,
  parentDom: Node & ParentNode,
  nextElement: Element,
  renderReturn: (item: any, idx?: number, isInsert?: boolean) => Node,
  reuseMode?: boolean
) => {
  let parentRef: { parent: Node & ParentNode; next: Node } = null;
  arr.$val.on("beforemulti", function() {
    if (parentDom.parentNode) {
      parentRef = {
        parent: parentDom,
        next: (parentDom as Element).nextElementSibling
      };
      parentDom = document.createDocumentFragment();
    }
  });
  arr.$val.on("aftermulti", function() {
    if (parentRef) {
      parentRef.parent.insertBefore(parentDom, parentRef.next);
      parentDom = parentRef.parent;
    }
  });

  arr.$val.on("itemadded", function(e) {
    insertToDom(parentDom, e.index, renderReturn(e.item, e.index));
  });

  arr.$val.on("itemset", function(e) {
    parentDom.replaceChild(
      renderReturn(e.item, e.index) as any,
      parentDom.children.item(e.index)
    );
  });

  arr.$val.on("itemremoved", function(e) {
    parentDom.removeChild(parentDom.children.item(e.index));
  });

  let firstRenderOnFragment = undefined;
  const arrayComputeRenderAll = function(nextVal) {
    if (!reuseMode) {
      const parentFragment = document.createDocumentFragment();
      parentDom.textContent = "";
      for (var i = 0; i < nextVal.length; i++) {
        parentFragment.appendChild(renderReturn(nextVal[i]));
      }
      parentDom.appendChild(parentFragment);
    } else {
      if (firstRenderOnFragment === undefined && nextVal && nextVal.length > 0)
        firstRenderOnFragment = document.createDocumentFragment();
      reuseNodes(
        firstRenderOnFragment || parentDom,
        arr.$val.innerArray,
        nextVal || [],
        nextItem => {
          return renderReturn(nextItem);
        },
        (nextItem, prevItem) => {
          for (var key in nextItem) {
            if (prevItem[key].hasOwnProperty("$val")) {
              nextItem[key].c_depends = prevItem[key].c_depends;
              nextItem[key].bc_depends = prevItem[key].bc_depends;
              prevItem[key](nextItem[key]());
            }
          }
        }
      );
      if (firstRenderOnFragment) {
        parentDom.appendChild(firstRenderOnFragment);
        firstRenderOnFragment = null;
      }
    }
  };

  beforeCompute(arr.$val, arrayComputeRenderAll, () => [arr]);
};
