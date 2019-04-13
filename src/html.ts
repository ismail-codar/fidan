import { FidanValue, array, computeBy } from "./f";
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

let _templateMode = false; // TODO kaldırılacak yerine başka bir yöntem geliştirilecek
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
      // htm[i] =
      //   item.substr(0, p) + comment + item.substr(p, item.lastIndexOf(" ") - p);
      // if (htm[index + 1].substr(0, 1) === '"') {
      //   htm[index + 1] = htm[index + 1].substr(1);
      // }
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
      if (param["$indexes"] === undefined) {
        param["$indexes"] = [];
      }
      param["$indexes"].push(index);
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
  const element = template.content;
  element["$params"] = params;
  if (!_templateMode) {
    updateNodesByCommentNodes(element, params);
  }
  return element;
};

const walkForCommentNodes = (element, commentNodes) => {
  var treeWalker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_COMMENT,
    {
      acceptNode: function(node) {
        var nodeValue = node.nodeValue.trim();
        return nodeValue.startsWith("cmt_")
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      }
    },
    false
  );

  while (treeWalker.nextNode()) {
    commentNodes.push(treeWalker.currentNode);
  }
};

const updateNodesByCommentNodes = (element: Node, params: any[]) => {
  var commentNodes = [];
  walkForCommentNodes(element, commentNodes);

  for (var i = 0; i < commentNodes.length; i++) {
    const commentNode = commentNodes[i];
    var commentValue = commentNode.nodeValue;
    let element = null;
    let attributeName: string = null;

    let i1 = commentValue.indexOf("_") + 1;
    var i2 = commentValue.indexOf("_", i1);
    const commentType = parseInt(commentValue.substr(i1, i2 - i1));
    i1 = commentValue.indexOf("_", i2) + 1;
    i2 = commentValue.indexOf("_", i1);
    if (i2 === -1) {
      i2 = commentValue.indexOf(" ", i1);
    }
    let paramIndex = parseInt(commentValue.substr(i1, i2 - i1));
    let param = params[paramIndex];

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
        attributeName = commentValue.substr(
          i2 + 1,
          commentValue.length - i2 - 2
        );
        element = commentNode.nextElementSibling;
      }
      if (attributeName.startsWith("on")) {
        (element as Element).addEventListener(attributeName.substr(2), param);
      } else if (param.hasOwnProperty("$val")) {
        if (htmlProps[attributeName]) {
          computeBy(param, val => {
            element[attributeName] = val;
          });
        } else {
          computeBy(param, val => {
            element.setAttribute(attributeName, val);
          });
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
  renderCallback: (data: number) => any,
  useCloneNode?: boolean
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
  if (useCloneNode) {
    return (commentNode: Node) => {
      const element = commentNode.parentElement;
      let clonedNode = null;
      let params = null;
      let dataParamIndexes = [];
      const arrayMapFn = (data, rowIndex) => {
        let renderNode = null;
        if (clonedNode === null) {
          _templateMode = true;
          renderNode = renderCallback(data);
          _templateMode = false;
          params = renderNode["$params"];
          for (var key in data) {
            const indexes = data[key]["$indexes"];
            for (var i = 0; i < indexes.length; i++) {
              dataParamIndexes.push(indexes[i], key);
            }
          }
          clonedNode = renderNode.cloneNode(true);
        } else {
          renderNode = clonedNode.cloneNode(true);
        }
        for (var i = 0; i < dataParamIndexes.length; i += 2) {
          params[dataParamIndexes[i]] = data[dataParamIndexes[i + 1]];
        }
        updateNodesByCommentNodes(renderNode, params);
        return renderNode;
      };
      arrayMap(arr as any, element, arrayMapFn);
    };
  } else {
    return function(commentNode) {
      var element = commentNode.parentElement;
      arrayMap(arr as any, element, renderCallback);
    };
  }
};
