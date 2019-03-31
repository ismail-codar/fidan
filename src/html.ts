import { FidanValue, array, compute } from "./f";
import { arrayMap } from "./dom";

const htmlProps = {
  id: true,
  nodeValue: true,
  textContent: true,
  className: true,
  innerHTML: true,
  innerText: true,
  tabIndex: true,
  value: true
};

let _templateMode = false;

const putCommentToTagStart = (
  htm: string[],
  index: number,
  comment: string
) => {
  for (var i = index; i >= 0; i--) {
    let item = htm[i];
    let p = item.lastIndexOf("<");
    if (p !== -1) {
      htm[i] = item.substr(0, p) + comment + item.substr(p);
      break;
    }
  }
};

export const html = (...args) => {
  const htm: string[] = args[0].slice();
  const params = args.slice(1);
  let attributeName: string = null;
  let i = 0;

  htm.forEach((item, index) => {
    const param = params[index];
    if (param === undefined) {
      return item;
    }
    const isDynamic = param.hasOwnProperty("$val");
    if (isDynamic) {
      param["$index"] = index;
    }
    if (item.endsWith('="')) {
      i = item.lastIndexOf(" ") + 1;
      attributeName = item.substr(i, item.length - i - 2);
      putCommentToTagStart(
        htm,
        index,
        `<!-- cmt_dom_${index}_${attributeName} -->`
      );
    } else {
      let commentType =
        typeof param === "function" && !isDynamic
          ? "fn"
          : param instanceof Node
          ? "htm"
          : "text";
      htm[index] = item + `<!-- cmt_${commentType}_${index} -->`;
    }
  });

  var template = document.createElement("template");
  template.innerHTML = htm.join("");
  const element = template.content.firstElementChild;
  element["$params"] = params;
  if (!_templateMode) {
    updateNodesByCommentNodes(element, params);
  }
  return element;
};

const updateNodesByCommentNodes = (element: Element, params: any[]) => {
  var treeWalker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_COMMENT,
    {
      acceptNode: function(node) {
        const nodeValue = node.nodeValue.trim();
        return nodeValue.startsWith("cmt_")
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      }
    },
    false
  );
  var commentNodes = [];
  while (treeWalker.nextNode()) commentNodes.push(treeWalker.currentNode);

  commentNodes.forEach((commentNode: Element) => {
    const commentValue: string[] = commentNode.nodeValue.trim().split("_");
    if (commentValue[0] !== "cmt") {
      return;
    }
    let element = null;
    let attributeName: string = null;
    let index = Number(commentValue[2]);
    let param = params[index];
    const commentType = commentValue[1];
    if (commentType === "text") {
      attributeName = "textContent";
      element = document.createTextNode(param.$val);
      commentNode.parentElement.insertBefore(element, commentNode.nextSibling);
      if (!param.hasOwnProperty("$val")) {
        if (Array.isArray(param)) {
          param.forEach(item => {
            commentNode.parentElement.appendChild(item);
          });
          return;
        }
      }
    } else if (commentType === "dom") {
      attributeName = commentValue[3];
      element = commentNode.nextElementSibling;
    } else if (commentType === "fn") {
      param(commentNode);
      return;
    } else if (commentType === "htm") {
      commentNode.parentElement.insertBefore(param, commentNode.nextSibling);
      return;
    }

    if (attributeName.startsWith("on")) {
      (element as Element).addEventListener(attributeName.substr(2), param);
    } else if (param.hasOwnProperty("$val")) {
      compute(
        htmlProps[attributeName]
          ? () => {
              element[attributeName] = param.$val;
            }
          : () => {
              element.setAttribute(attributeName, param.$val);
            },
        param
      );
    } else {
      if (htmlProps[attributeName]) {
        element[attributeName] = param;
      } else {
        element.setAttribute(attributeName, param);
      }
    }
  });
};

export const htmlArrayMap = (
  arr: any[] | FidanValue<any[]>,
  renderCallback: (data, rowIndex?: number) => any
) => {
  if (Array.isArray(arr)) {
    const oArray = array(arr);
    [
      "copyWithin",
      "fill",
      "pop",
      "push",
      "reverse",
      "shift",
      "sort",
      "splice",
      "unshift"
    ].forEach(method => (arr[method] = oArray.$val[method]));
    arr = oArray;
  }
  return (commentNode: Node) => {
    const element = commentNode.parentElement;
    let clonedNode = null;
    let params = null;
    let dataParamIndexes = {};
    arrayMap(arr as any, element, (data, rowIndex) => {
      let renderNode = null;
      if (clonedNode === null) {
        _templateMode = true;
        renderNode = renderCallback(data, rowIndex);
        _templateMode = false;
        params = renderNode["$params"];
        for (var key in data) {
          dataParamIndexes[key] = data[key]["$index"];
        }
        clonedNode = renderNode.cloneNode(true);
      } else {
        renderNode = clonedNode.cloneNode(true);
      }
      for (var key in dataParamIndexes) {
        params[dataParamIndexes[key]] = data[key];
      }
      // TODO rowIndex in params
      updateNodesByCommentNodes(renderNode, params);
      return renderNode;
    });
  };
};
