import { FidanValue, array, compute } from "./f";
import { arrayMap } from "./dom";

const COMMENT_TEXT = 1;
const COMMENT_DOM = 2;
const COMMENT_FN = 4;
const COMMENT_HTM = 8;
const COMMENT_TEXT_OR_DOM = COMMENT_TEXT | COMMENT_DOM;

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
let template = document.createElement("template");

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

  for (var index = 0; index < htm.length; index++) {
    let item = htm[index];
    const param = params[index];
    if (param === undefined) {
      break;
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
        `<!-- cmt_${COMMENT_DOM}_${index}_${attributeName} -->`
      );
    } else {
      let commentType =
        typeof param === "function" && !isDynamic
          ? COMMENT_FN
          : typeof param === "object"
          ? COMMENT_HTM
          : COMMENT_TEXT;
      htm[index] = item + `<!-- cmt_${commentType}_${index} -->`;
    }
  }
  template = template.cloneNode(false) as HTMLTemplateElement;
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

  for (var i = 0; i < commentNodes.length; i++) {
    const commentNode = commentNodes[i];
    const commentValue: string[] = commentNode.nodeValue.trim().split("_"); // TODO avoid split
    let element = null;
    let attributeName: string = null;
    let paramIndex = parseInt(commentValue[2]);
    let param = params[paramIndex];
    const commentType = parseInt(commentValue[1]);

    if (commentType & COMMENT_TEXT_OR_DOM) {
      if (commentType === COMMENT_TEXT) {
        attributeName = "textContent";
        element = document.createTextNode(param.$val);
        commentNode.parentElement.insertBefore(
          element,
          commentNode.nextSibling
        );
        if (!param.hasOwnProperty("$val")) {
          if (Array.isArray(param)) {
            for (var p = 0; p < param.length; p++) {
              commentNode.parentElement.appendChild(param[p]);
            }
          }
        }
      } else if (commentType === COMMENT_DOM) {
        attributeName = commentValue[3];
        element = commentNode.nextElementSibling;
      }
      if (attributeName.startsWith("on")) {
        (element as Element).addEventListener(attributeName.substr(2), param);
      } else if (param.hasOwnProperty("$val")) {
        if (htmlProps[attributeName]) {
          compute(() => {
            element[attributeName] = param.$val;
          }, param);
        } else {
          compute(() => {
            element.setAttribute(attributeName, param.$val);
          }, param);
        }
      } else {
        if (htmlProps[attributeName]) {
          element[attributeName] = param;
        } else {
          element.setAttribute(attributeName, param);
        }
      }
    } else if (commentType === COMMENT_FN) {
      param(commentNode);
    } else if (commentType === COMMENT_HTM) {
      commentNode.parentElement.insertBefore(param, commentNode.nextSibling);
    }
  }
};

export const htmlArrayMap = (
  arr: any[] | FidanValue<any[]>,
  renderCallback: (data: number) => any
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
    const arrayMapFn = (data, rowIndex) => {
      let renderNode = null;
      if (clonedNode === null) {
        _templateMode = true;
        renderNode = renderCallback(data);
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
    };
    arrayMap(arr as any, element, arrayMapFn);
  };
};
